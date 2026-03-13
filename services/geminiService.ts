
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CategorizationResult, GroundingSource } from "../types";

// In a real production app, this would be a backend call to hide the API key.
// Here we initialize with the env key or local storage key.
const getClient = () => {
  const localKey = localStorage.getItem('GEMINI_API_KEY');
  const envKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  const apiKey = localKey || envKey;
  
  if (!apiKey) {
    throw new Error("API_KEY is not set. Please configure it in Settings.");
  }
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
You are a world-class product categorization engine. Your task is to take an item description and determine its most accurate Category and Subcategory.
You MUST return your answer in STRCIT JSON format following this schema:
{
  "original": "original text",
  "normalized": "clean, trimmed version",
  "category": "Broad Category (e.g., Electronics, Apparel, Home & Kitchen)",
  "subcategory": "Specific Subcategory (e.g., Smartphones, Men's Sneakers, Coffee Beans)",
  "confidence": 0.0-1.0,
  "rationale": "Briefly explain why this category was chosen",
  "sources": []
}

Rules:
1. Use Google Search grounding to verify what the product is if the name is ambiguous.
2. If the item is unknown even after search, use "Unknown" for category and subcategory and set confidence low.
3. Keep rationale under 100 characters.
4. Categories should be standard retail industry terms.
`;

export const categorizeItem = async (
  itemText: string,
  originalRow: number
): Promise<CategorizationResult> => {
  const ai = getClient();
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Categorize this item: "${itemText}"`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            normalized: { type: Type.STRING },
            category: { type: Type.STRING },
            subcategory: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            rationale: { type: Type.STRING }
          },
          required: ["original", "normalized", "category", "subcategory", "confidence", "rationale"]
        }
      },
    });

    const jsonText = response.text || '{}';
    const data = JSON.parse(jsonText);

    // Extract sources from grounding metadata if available
    const sources: GroundingSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && Array.isArray(groundingChunks)) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    return {
      ...data,
      sources,
      originalRow
    };
  } catch (error) {
    console.error(`Error categorizing item "${itemText}":`, error);
    return {
      original: itemText,
      normalized: itemText.trim(),
      category: "Error",
      subcategory: "Processing Error",
      confidence: 0,
      rationale: "API Error occurred during processing.",
      sources: [],
      originalRow
    };
  }
};

/**
 * Processes items in parallel batches with rate limit considerations.
 */
export const categorizeItemsInBatches = async (
  items: { original: string; originalRow: number }[],
  onProgress: (result: CategorizationResult) => void
): Promise<CategorizationResult[]> => {
  const results: CategorizationResult[] = [];
  const cache = new Map<string, CategorizationResult>();
  
  // Batch size of 3 for efficiency vs rate limits
  const BATCH_SIZE = 3;
  
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (item) => {
      // De-duplication check
      const normalizedKey = item.original.toLowerCase().trim();
      if (cache.has(normalizedKey)) {
        const cached = cache.get(normalizedKey)!;
        const result = { ...cached, originalRow: item.originalRow };
        onProgress(result);
        return result;
      }

      const result = await categorizeItem(item.original, item.originalRow);
      cache.set(normalizedKey, result);
      onProgress(result);
      return result;
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    
    // Slight delay between batches to respect free tier limits
    if (i + BATCH_SIZE < items.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
};
