
import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, FileText, Upload } from 'lucide-react';
import CategorizeTab from './components/CategorizeTab';
import CategoriesTab from './components/CategoriesTab';
import Header from './components/Header';
import { CategorizationResult, FileConfig, ProcessingState } from './types';
import { extractItems, parseExcelFile } from './services/excelService';
import { categorizeItemsInBatches } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categorize' | 'categories'>('categorize');
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  // Lifted states from CategorizeTab
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<any>(null);
  const [config, setConfig] = useState<FileConfig>({
    sheetName: '',
    columnName: 'A',
    startRow: 2,
    hasHeader: true
  });
  const [processing, setProcessing] = useState<ProcessingState>({
    total: 0,
    processed: 0,
    results: [],
    isProcessing: false,
    error: null
  });

  const handleProcessFile = async (uploadedFile: File) => {
    try {
      const wb = await parseExcelFile(uploadedFile);
      setWorkbook(wb);
      setFile(uploadedFile);
      setConfig(prev => ({
        ...prev,
        sheetName: wb.SheetNames[0] || ''
      }));
      setProcessing(prev => ({ ...prev, error: null }));
    } catch (err) {
      setProcessing(prev => ({ ...prev, error: "Failed to parse Excel file. Please ensure it's a valid .xlsx file." }));
    }
  };

  const handleStartCategorization = async () => {
    if (!workbook || !config.sheetName) return;

    const itemsToProcess = extractItems(workbook, config);
    if (itemsToProcess.length === 0) {
      setProcessing(prev => ({ ...prev, error: "No items found in the selected sheet/column." }));
      return;
    }

    setProcessing({
      total: itemsToProcess.length,
      processed: 0,
      results: [],
      isProcessing: true,
      error: null
    });

    try {
      await categorizeItemsInBatches(itemsToProcess, (newResult) => {
        setProcessing(prev => ({
          ...prev,
          processed: prev.processed + 1,
          results: [...prev.results, newResult]
        }));
      });
      setProcessing(prev => ({ ...prev, isProcessing: false }));
    } catch (err) {
      setProcessing(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: "Categorization interrupted. Some items may have failed." 
      }));
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target || (e.relatedTarget === null)) {
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const dropped = files[0];
      if (dropped.name.endsWith('.xlsx')) {
        handleProcessFile(dropped);
        setActiveTab('categorize');
      }
    }
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col bg-slate-50 relative"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Global Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-[100] bg-blue-600/90 backdrop-blur-sm flex items-center justify-center p-8 transition-all animate-in fade-in duration-200">
          <div className="max-w-md w-full border-4 border-dashed border-white/40 rounded-3xl p-12 text-center flex flex-col items-center space-y-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white animate-bounce">
              <Upload size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">Drop your Excel file</h2>
              <p className="text-blue-100 text-lg">Release to start categorizing your items</p>
            </div>
          </div>
        </div>
      )}

      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm mb-8 w-fit border border-slate-200">
          <button
            onClick={() => setActiveTab('categorize')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'categorize'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText size={18} />
            <span>Categorize</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={18} />
            <span>Categories</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'categorize' ? (
            <CategorizeTab 
              file={file}
              setFile={setFile}
              workbook={workbook}
              setWorkbook={setWorkbook}
              config={config}
              setConfig={setConfig}
              processing={processing}
              setProcessing={setProcessing}
              handleProcessFile={handleProcessFile}
              handleStartCategorization={handleStartCategorization}
            />
          ) : (
            <CategoriesTab results={processing.results} />
          )}
        </div>
      </main>

      <footer className="py-6 border-t border-slate-200 text-center text-slate-400 text-sm">
        Item Auto-Categorizer &copy; {new Date().getFullYear()} • Powered by Gemini 3 Flash
      </footer>
    </div>
  );
};

export default App;
