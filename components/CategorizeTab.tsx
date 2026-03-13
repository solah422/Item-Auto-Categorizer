
import React, { useRef } from 'react';
import { 
  Upload, 
  Settings, 
  Play, 
  Download, 
  FileJson, 
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Table as TableIcon
} from 'lucide-react';
import { FileConfig, ProcessingState } from '../types';
import { generateOutputExcel, createSampleFile } from '../services/excelService';
import ProgressBar from './ProgressBar';
import ResultsTable from './ResultsTable';

interface Props {
  file: File | null;
  setFile: (file: File | null) => void;
  workbook: any;
  setWorkbook: (workbook: any) => void;
  config: FileConfig;
  setConfig: React.Dispatch<React.SetStateAction<FileConfig>>;
  processing: ProcessingState;
  setProcessing: React.Dispatch<React.SetStateAction<ProcessingState>>;
  handleProcessFile: (file: File) => Promise<void>;
  handleStartCategorization: () => Promise<void>;
}

const CategorizeTab: React.FC<Props> = ({ 
  file, 
  setFile, 
  workbook, 
  setWorkbook, 
  config, 
  setConfig, 
  processing, 
  setProcessing,
  handleProcessFile,
  handleStartCategorization
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      handleProcessFile(uploadedFile);
    }
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(processing.results, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "categorized_items.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // UI Helpers
  const sheets = workbook?.SheetNames || [];
  const columns = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];

  return (
    <div className="space-y-6">
      {!file ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center transition-all hover:border-blue-300">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Upload size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Upload your inventory file</h2>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Drop an Excel (.xlsx) file anywhere or click to browse. We'll handle the categorization for you.
          </p>
          <div className="mt-8 flex flex-col items-center space-y-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center space-x-2"
            >
              <span>Choose File</span>
            </button>
            <button
              onClick={createSampleFile}
              className="text-blue-600 text-sm font-medium hover:underline flex items-center space-x-1"
            >
              <FileSpreadsheet size={16} />
              <span>Download sample template</span>
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx"
            className="hidden"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="text-blue-600" size={20} />
                <h3 className="font-bold text-slate-800">Configuration</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Select Sheet
                  </label>
                  <select
                    value={config.sheetName}
                    onChange={(e) => setConfig({ ...config, sheetName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    {sheets.map((s: string) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Item Name Column
                  </label>
                  <select
                    value={config.columnName}
                    onChange={(e) => setConfig({ ...config, columnName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    {columns.map((c) => (
                      <option key={c} value={c}>Column {c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Start Row
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={config.startRow}
                      onChange={(e) => setConfig({ ...config, startRow: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center space-x-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={config.hasHeader}
                        onChange={(e) => setConfig({ ...config, hasHeader: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-200"
                      />
                      <span className="text-xs font-medium text-slate-600">Row 1 is Header</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span>File: <span className="text-slate-700 font-medium">{file.name}</span></span>
                    <button 
                      onClick={() => { setFile(null); setWorkbook(null); setProcessing(p => ({ ...p, results: [] })); }}
                      className="text-red-500 hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <button
                    disabled={processing.isProcessing}
                    onClick={handleStartCategorization}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                      processing.isProcessing
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98]'
                    }`}
                  >
                    {processing.isProcessing ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                    <span>{processing.isProcessing ? 'Processing...' : 'Run Categorization'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {processing.error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
                <p className="text-xs text-red-700 font-medium">{processing.error}</p>
              </div>
            )}
          </div>

          {/* Main Results View */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar Component */}
            {(processing.isProcessing || processing.processed > 0) && (
              <ProgressBar 
                processed={processing.processed} 
                total={processing.total} 
                isDone={!processing.isProcessing && processing.processed > 0} 
              />
            )}

            {/* Empty State vs Results */}
            {processing.results.length === 0 && !processing.isProcessing ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <TableIcon className="mx-auto text-slate-300 mb-4" size={48} />
                <h4 className="text-slate-800 font-bold">No results yet</h4>
                <p className="text-slate-500 text-sm mt-1">Configure and start the run to see live data.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                    <span>Processing Results</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                      {processing.results.length} items
                    </span>
                  </h3>

                  {processing.processed === processing.total && !processing.isProcessing && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => generateOutputExcel(processing.results)}
                        className="flex items-center space-x-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        <Download size={16} />
                        <span>Excel</span>
                      </button>
                      <button 
                        onClick={downloadJson}
                        className="flex items-center space-x-1 text-sm bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <FileJson size={16} />
                        <span>JSON</span>
                      </button>
                    </div>
                  )}
                </div>

                <ResultsTable results={processing.results} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorizeTab;
