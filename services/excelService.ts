
import { CategorizationResult, FileConfig } from '../types';

// Declare XLSX as any since it is loaded via CDN in index.html
declare const XLSX: any;

export const parseExcelFile = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        resolve(workbook);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};

export const extractItems = (
  workbook: any,
  config: FileConfig
): { original: string; originalRow: number }[] => {
  const sheet = workbook.Sheets[config.sheetName];
  if (!sheet) return [];

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const items: { original: string; originalRow: number }[] = [];

  // Data starts at config.startRow (1-based index)
  for (let i = config.startRow - 1; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;

    // Get column index from column name (A, B, C...)
    const colIndex = XLSX.utils.decode_col(config.columnName);
    const value = row[colIndex];

    if (value !== undefined && value !== null && String(value).trim() !== '') {
      items.push({
        original: String(value).trim(),
        originalRow: i + 1,
      });
    }
  }

  return items;
};

export const generateOutputExcel = (results: CategorizationResult[]): void => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Categorized Items
  const categorizedData = results.map(r => ({
    'Original Item': r.original,
    'Normalized Item': r.normalized,
    'Category': r.category,
    'Subcategory': r.subcategory,
    'Original Row': r.originalRow
  })).sort((a, b) => {
    if (a.Category !== b.Category) return a.Category.localeCompare(b.Category);
    if (a.Subcategory !== b.Subcategory) return a.Subcategory.localeCompare(b.Subcategory);
    return a['Original Item'].localeCompare(b['Original Item']);
  });

  const wsCategorized = XLSX.utils.json_to_sheet(categorizedData);
  XLSX.utils.book_append_sheet(workbook, wsCategorized, "Categorized Items");

  // Sheet 2: Categories
  const catMap = new Map<string, number>();
  results.forEach(r => catMap.set(r.category, (catMap.get(r.category) || 0) + 1));
  const categoriesData = Array.from(catMap.entries())
    .map(([name, count]) => ({ Category: name, Count: count }))
    .sort((a, b) => b.Count - a.Count);
  
  const wsCategories = XLSX.utils.json_to_sheet(categoriesData);
  XLSX.utils.book_append_sheet(workbook, wsCategories, "Categories");

  // Sheet 3: Subcategories
  const subMap = new Map<string, number>();
  results.forEach(r => {
    const key = `${r.category}|${r.subcategory}`;
    subMap.set(key, (subMap.get(key) || 0) + 1);
  });
  const subcategoriesData = Array.from(subMap.entries())
    .map(([key, count]) => {
      const [cat, sub] = key.split('|');
      return { Category: cat, Subcategory: sub, Count: count };
    })
    .sort((a, b) => {
      if (a.Category !== b.Category) return a.Category.localeCompare(b.Category);
      return b.Count - a.Count;
    });

  const wsSubcategories = XLSX.utils.json_to_sheet(subcategoriesData);
  XLSX.utils.book_append_sheet(workbook, wsSubcategories, "Subcategories");

  // Write file
  XLSX.writeFile(workbook, `Categorized_Items_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const createSampleFile = (): void => {
  const data = [
    ["Product Name", "SKU"],
    ["Apple iPhone 15 Pro Max 256GB Titanium", "SKU-001"],
    ["Nike Air Max 270 React Sneakers", "SKU-002"],
    ["Starbucks Pike Place Roast Coffee Beans 1lb", "SKU-003"],
    ["LEGO Star Wars Millennium Falcon", "SKU-004"],
    ["Patagonia Better Sweater Fleece Jacket", "SKU-005"],
    ["KitchenAid Artisan Series 5-Quart Stand Mixer", "SKU-006"],
    ["Dyson V15 Detect Cordless Vacuum", "SKU-007"],
    ["Nintendo Switch OLED Model", "SKU-008"]
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Inventory");
  XLSX.writeFile(wb, "Sample_Inventory.xlsx");
};
