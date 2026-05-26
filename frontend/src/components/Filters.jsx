import React from 'react';
import { Filter, Star } from 'lucide-react';

const Filters = ({ status, setStatus, minImportance, setMinImportance }) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl w-full flex flex-col gap-5">
      <div className="flex items-center gap-2 text-white font-medium border-b border-slate-850 pb-2">
        <Filter className="text-violet-500 w-5 h-5" />
        <span>Filters</span>
      </div>

      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Status
          </label>
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            {['all', 'pending', 'completed'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 text-center py-1.5 px-3 text-sm font-medium rounded-md transition capitalize ${
                  status === s
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Importance Filter */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Min Importance
            </label>
            <span className="text-sm font-semibold text-violet-400 flex items-center gap-1">
              {minImportance} <Star className="w-3.5 h-3.5 fill-violet-400/20 text-violet-400" />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">1</span>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={minImportance}
              onChange={(e) => setMinImportance(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-600 border border-slate-800"
            />
            <span className="text-xs text-slate-500">5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
