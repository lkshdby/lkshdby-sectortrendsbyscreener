import React from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';
import { SchedulerInfo } from '../types';

interface SchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedulerInfo: SchedulerInfo | null;
  onTriggerFetch: () => void;
  isFetching: boolean;
}

export const SchedulerModal: React.FC<SchedulerModalProps> = ({
  isOpen,
  onClose,
  schedulerInfo,
  onTriggerFetch,
  isFetching,
}) => {
  if (!isOpen) return null;

  const nextRun = schedulerInfo?.nextRunTime ? new Date(schedulerInfo.nextRunTime) : null;
  const lastRun = schedulerInfo?.lastRunTime ? new Date(schedulerInfo.lastRunTime) : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-700 text-white">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                7:00 PM Daily Auto-Fetch Scheduler
              </h3>
              <p className="text-xs text-zinc-500">
                Sharp 7 PM execution engine for weekday Screener.in industry data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-200/80 hover:bg-zinc-300 flex items-center justify-center text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <span className="font-bold text-emerald-950 text-sm">Cron Job Active & Running</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-semibold">
              0 19 * * 1-5
            </span>
          </div>

          {/* Timing details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-zinc-500 block mb-1">Execution Schedule:</span>
              <div className="font-bold text-zinc-900">
                Every Weekday (Mon-Fri) at 19:00 IST
              </div>
              <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>Excludes Sat & Sun</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span className="text-zinc-500 block mb-1">Next Scheduled Run:</span>
              <div className="font-bold text-emerald-800">
                {nextRun
                  ? nextRun.toLocaleString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Calculating...'}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Last Run: {lastRun ? lastRun.toLocaleTimeString('en-IN') : 'Loaded at startup'}
              </div>
            </div>
          </div>

          {/* Manual Run Section */}
          <div className="p-4 bg-zinc-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">Need fresh data right now?</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Trigger the 7:00 PM scrape pipeline manually for today's market snapshot.
              </div>
            </div>
            <button
              onClick={onTriggerFetch}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Fetching...' : 'Run Scraper Now'}</span>
            </button>
          </div>

          {/* Terminal Logs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-zinc-700 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                Scheduler Execution Logs:
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Live Stream</span>
            </div>
            <div className="bg-zinc-950 text-zinc-300 font-mono text-[11px] p-3 rounded-xl max-h-40 overflow-y-auto space-y-1 border border-zinc-800">
              {schedulerInfo?.log && schedulerInfo.log.length > 0 ? (
                schedulerInfo.log.map((line, i) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-emerald-500">➜</span> {line}
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 italic">Cron initialized and monitoring 19:00 IST weekday slots...</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
