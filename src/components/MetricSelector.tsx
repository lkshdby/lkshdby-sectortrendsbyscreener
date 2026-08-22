import React from 'react';
import { MetricKey } from '../types';
import { METRIC_DEFINITIONS, METRIC_KEYS } from '../utils/metrics';

interface MetricSelectorProps {
  selectedMetric: MetricKey;
  onSelectMetric: (key: MetricKey) => void;
}

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  selectedMetric,
  onSelectMetric,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Select Indicator (8 Metrics)
        </span>
        <span className="text-xs text-zinc-500 hidden sm:inline">
          {METRIC_DEFINITIONS[selectedMetric].description}
        </span>
      </div>

      {/* The 8 Buttons on top */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {METRIC_KEYS.map((key) => {
          const def = METRIC_DEFINITIONS[key];
          const isSelected = selectedMetric === key;

          return (
            <button
              key={key}
              id={`metric-btn-${key}`}
              onClick={() => onSelectMetric(key)}
              className={`relative px-3 py-2.5 rounded-xl text-left border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm ring-2 ring-zinc-900/10'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs font-bold leading-tight ${
                    isSelected ? 'text-white' : 'text-zinc-900'
                  }`}
                >
                  {def.label}
                </span>
                {def.unit && (
                  <span
                    className={`text-[10px] font-mono px-1 rounded ${
                      isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {def.unit}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] mt-1.5 line-clamp-1 ${
                  isSelected ? 'text-zinc-300' : 'text-zinc-500'
                }`}
              >
                {def.shortLabel}
              </span>

              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
