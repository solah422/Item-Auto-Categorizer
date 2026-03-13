
export interface GroundingSource {
  title: string;
  uri: string;
}

export interface CategorizationResult {
  original: string;
  normalized: string;
  category: string;
  subcategory: string;
  confidence: number;
  rationale: string;
  sources: GroundingSource[];
  originalRow: number;
}

export interface ProcessingState {
  total: number;
  processed: number;
  results: CategorizationResult[];
  isProcessing: boolean;
  error: string | null;
}

export interface FileConfig {
  sheetName: string;
  columnName: string;
  startRow: number;
  hasHeader: boolean;
}

export interface ExcelRow {
  [key: string]: any;
}

export interface CategorySummary {
  name: string;
  count: number;
}

export interface SubcategorySummary {
  category: string;
  subcategory: string;
  count: number;
}
