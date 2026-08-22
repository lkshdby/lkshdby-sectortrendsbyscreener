import React from 'react';
import { ArrowDownUp, BarChart2, CalendarDays, Clock, Sparkles } from 'lucide-react';
import { TimeResolution } from '../types';

interface ResolutionSelectorProps {
  resolution: TimeResolution;
  onSelectResolution: (res: TimeResolution) => void;
  sortBy: 'value-desc' | 'value-asc' | 'change-desc' | 'change-asc' | 'alphabetical';
  onSelectSortBy: (sort: 'value-desc' | 'value-asc' | 'change-desc' | 'change-asc' | 'alphabetical') => void;
  totalSnapshots: number;
}

export const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({
  resolution,
  onSelectResolution,
  sortBy,
  onSelectSortBy,
  totalSnapshots,
}) => {
  const resolutions: { id: TimeResolution; label: string; sub: string }[] = [
    { id: 'daily', label: 'Daily', sub: 'Day-on-Day change' },
    { id: 'weekly', label: 'Weekly', sub: 'Week-on-Week trends' },
    { id: 'monthly', label: 'Monthly', sub: 'Month-on-Month shifts' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-2.5">
      {/* Zoom Level Button Group */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-semibold text-zinc-500 mr-1 flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
          Zoom Resolution:
        </span>
        <div className="inline-flex p-1 bg-zinc-200/70 rounded-lg gap-1">
          {resolutions.map((r) => {
            const isActive = resolution === r.id;
            return (
              <button
                key={r.id}
                id={`res-btn-${r.id}`}
                onClick={() => onSelectResolution(r.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  isActive
                    ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                }`}
                title={r.sub}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sorting & Order */}
      <div className="flex items-center gap-2">
        <div className="flex items-center text-xs text-zinc-600 bg-white border border-zinc-200 rounded-lg px-2.5 py-1 shadow-2xs">
          <ArrowDownUp className="w-3.5 h-3.5 text-zinc-400 mr-1.5 shrink-0" />
          <span className="text-zinc-500 font-medium mr-1.5">Sort:</span>
          <select
            id="resolution-sort-select"
            value={sortBy}
            onChange={(e) => onSelectSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-bold text-zinc-800 focus:outline-hidden cursor-pointer"
          >
            <option value="value-desc">Highest Value First</option>
            <option value="value-asc">Lowest Value First</option>
            <option value="change-desc">Top Gainers (%)</option>
            <option value="change-asc">Top Decliners (%)</option>
            <option value="alphabetical">Alphabetical (A–Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
