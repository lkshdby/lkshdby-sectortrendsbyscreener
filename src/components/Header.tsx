import React from 'react';
import {
  Activity,
  Calendar,
  Clock,
  Download,
  Play,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { DailySnapshot, SchedulerInfo } from '../types';

interface HeaderProps {
  snapshots: DailySnapshot[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  schedulerInfo: SchedulerInfo | null;
  onRefreshFetch: () => void;
  isFetching: boolean;
  onOpenExportModal: () => void;
  onOpenSchedulerModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  snapshots,
  selectedDate,
  onSelectDate,
  schedulerInfo,
  onRefreshFetch,
  isFetching,
  onOpenExportModal,
  onOpenSchedulerModal,
}) => {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 leading-none">
              Screener.in Industry Trends
            </h1>
            <p className="text-xs text-zinc-500 font-medium mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                7:00 PM IST Auto-Fetch (Mon–Fri)
              </span>
              <span>•</span>
              <span>{snapshots[snapshots.length - 1]?.sectors?.length || 0} Sectors Tracked</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Date Scrubber */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Date Picker Selector */}
          <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-zinc-400 mr-2" />
            <span className="font-medium text-zinc-500 mr-1.5">Snapshot:</span>
            <select
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="bg-transparent text-zinc-900 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {snapshots.slice().reverse().map((s) => {
                const d = new Date(s.date);
                const formatted = d.toLocaleDateString('en-IN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <option key={s.date} value={s.date}>
                    {formatted} ({s.date})
                  </option>
                );
              })}
            </select>
          </div>

          {/* 7 PM Cron Status Button */}
          <button
            id="scheduler-status-button"
            onClick={onOpenSchedulerModal}
            title="Inspect 7:00 PM Daily Auto-Fetch Scheduler"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-zinc-600" />
            <span>7 PM Cron</span>
          </button>

          {/* Trigger Immediate 7 PM Fetch */}
          <button
            id="fetch-now-button"
            onClick={onRefreshFetch}
            disabled={isFetching}
            title="Execute Screener 7 PM Fetch Script Now"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-emerald-700' : 'text-emerald-700'}`} />
            <span>{isFetching ? 'Fetching 7 PM...' : 'Fetch Now'}</span>
          </button>

          {/* Export & Backup */}
          <button
            id="export-modal-button"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export & Backup</span>
          </button>
        </div>
      </div>
    </header>
  );
};
