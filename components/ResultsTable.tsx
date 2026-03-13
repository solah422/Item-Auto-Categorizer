
import React from 'react';
import { CategorizationResult } from '../types';
import { ExternalLink, Info } from 'lucide-react';

interface Props {
  results: CategorizationResult[];
}

const ResultsTable: React.FC<Props> = ({ results }) => {
  // Show latest results first for better UX during live streaming
  const displayResults = [...results].reverse();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto max-h-[500px] scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="border-b border-slate-200">
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Item</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayResults.map((result, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-slate-800">{result.original}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Row {result.originalRow}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-tight">
                    {result.category}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-medium">{result.subcategory}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          result.confidence > 0.8 ? 'bg-green-500' : 
                          result.confidence > 0.5 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{(result.confidence * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start space-x-2 group-hover:pr-2">
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-[200px] leading-relaxed">
                      {result.rationale}
                    </p>
                    {result.sources.length > 0 && (
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={result.sources[0].uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title={result.sources[0].title}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
