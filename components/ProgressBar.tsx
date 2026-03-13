
import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface Props {
  processed: number;
  total: number;
  isDone: boolean;
}

const ProgressBar: React.FC<Props> = ({ processed, total, isDone }) => {
  const percentage = total > 0 ? (processed / total) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {isDone ? (
            <CheckCircle2 className="text-green-500" size={20} />
          ) : (
            <Clock className="text-blue-500 animate-pulse" size={20} />
          )}
          <span className="text-sm font-bold text-slate-800">
            {isDone ? 'Categorization Complete' : 'Processing Items...'}
          </span>
        </div>
        <span className="text-xs font-bold text-slate-500">{Math.round(percentage)}%</span>
      </div>
      
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full transition-all duration-500 ease-out rounded-full ${isDone ? 'bg-green-500' : 'bg-blue-600'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
        <span>{processed} items categorized</span>
        <span>{total - processed} remaining</span>
      </div>
    </div>
  );
};

export default ProgressBar;
