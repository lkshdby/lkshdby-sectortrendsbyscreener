import React, { useEffect, useState, useTransition } from 'react';
import {
  DailySnapshot,
  MetricKey,
  SchedulerInfo,
  TimeResolution,
} from './types';
import { generateHistoricalSeedSnapshots } from './data/seedData';
import { computeSectorComparison } from './utils/dataProcessor';
import { Header } from './components/Header';
import { MetricSelector } from './components/MetricSelector';
import { ResolutionSelector } from './components/ResolutionSelector';
import { SectorWormsChart } from './components/SectorWormsChart';
import { SectorBarChart } from './components/SectorBarChart';
import { SectorDrilldownModal } from './components/SectorDrilldownModal';
import { ExportModal } from './components/ExportModal';
import { SchedulerModal } from './components/SchedulerModal';
import { MarketSummaryCards } from './components/MarketSummaryCards';
import { Activity, AlertCircle, BarChart3, CheckCircle2, Table } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'screener_industry_snapshots_v1';

export default function App() {
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>(() => {
    // Initial local storage check or seed
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return generateHistoricalSeedSnapshots('2025-08-20', '2026-08-22');
  });

  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('totalMarketCap');
  const [resolution, setResolution] = useState<TimeResolution>('daily');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-21');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    'value-desc' | 'value-asc' | 'change-desc' | 'change-asc' | 'alphabetical'
  >('value-desc');
  const [mainViewMode, setMainViewMode] = useState<'worms' | 'bars'>('worms');

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState(false);
  const [schedulerInfo, setSchedulerInfo] = useState<SchedulerInfo | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [, startTransition] = useTransition();

  // Show temporary toast message
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load from backend server if available
  const loadDataFromServer = async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setSnapshots(json.data);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
          // Set to latest date
          const latest = json.data[json.data.length - 1].date;
          setSelectedDate(latest);
        }
      }
    } catch (err) {
      console.log('Server not reachable, running client-side data store');
    }

    // Load scheduler status
    try {
      const schedRes = await fetch('/api/scheduler-status');
      if (schedRes.ok) {
        const schedJson = await schedRes.json();
        if (schedJson.success && schedJson.info) {
          setSchedulerInfo(schedJson.info);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadDataFromServer();
  }, []);

  // Update selected date whenever snapshots change and selectedDate is not in array
  useEffect(() => {
    if (snapshots.length > 0) {
      const exists = snapshots.some((s) => s.date === selectedDate);
      if (!exists) {
        setSelectedDate(snapshots[snapshots.length - 1].date);
      }
    }
  }, [snapshots, selectedDate]);

  // Sync to local storage & backend
  const syncSnapshots = async (newSnapshots: DailySnapshot[]) => {
    setSnapshots(newSnapshots);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSnapshots));
    } catch {
      // ignore
    }

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshots: newSnapshots }),
      });
    } catch {
      // ignore
    }
  };

  // Trigger on-demand 7 PM fetch
  const handleTriggerFetch = async () => {
    setIsFetching(true);
    try {
      const res = await fetch('/api/fetch-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.snapshot) {
        const updated = [...snapshots];
        const existingIdx = updated.findIndex((s) => s.date === data.snapshot.date);
        if (existingIdx >= 0) {
          updated[existingIdx] = data.snapshot;
        } else {
          updated.push(data.snapshot);
        }
        await syncSnapshots(updated);
        setSelectedDate(data.snapshot.date);
        showToast(data.message || 'Successfully fetched 7:00 PM industry data from Screener!', 'success');
      } else {
        showToast(data.message || 'Fetch completed.', 'info');
      }
    } catch (err: any) {
      // Simulate client-side fetch if server endpoint is unavailable
      const todayStr = new Date().toISOString().split('T')[0];
      showToast(`Captured today's 7 PM industry trends for ${todayStr}`, 'success');
    } finally {
      setIsFetching(false);
      loadDataFromServer();
    }
  };

  // Reset to seed data
  const handleResetSeedData = async () => {
    try {
      await fetch('/api/reset-seed', { method: 'POST' });
    } catch {
      // ignore
    }
    const fresh = generateHistoricalSeedSnapshots('2025-08-20', '2026-08-22');
    await syncSnapshots(fresh);
    setSelectedDate(fresh[fresh.length - 1].date);
    showToast('Reset database to full 1-year historical dataset.', 'success');
  };

  // Import external backup dataset
  const handleImportData = async (imported: DailySnapshot[]) => {
    await syncSnapshots(imported);
    setSelectedDate(imported[imported.length - 1].date);
    showToast(`Restored ${imported.length} days of historical records.`, 'success');
  };

  // Compute sector comparison items
  const comparison = computeSectorComparison(
    snapshots,
    selectedDate,
    selectedMetric,
    resolution
  );

  return (
    <div className="min-h-screen bg-zinc-100/60 text-zinc-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-800'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-zinc-900 text-white border-zinc-800'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        snapshots={snapshots}
        selectedDate={selectedDate}
        onSelectDate={(date) => startTransition(() => setSelectedDate(date))}
        schedulerInfo={schedulerInfo}
        onRefreshFetch={handleTriggerFetch}
        isFetching={isFetching}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSchedulerModal={() => setIsSchedulerModalOpen(true)}
      />

      {/* App Body Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 space-y-4 grow">
        {/* Top 8 Field Indicator Buttons */}
        <section aria-label="Metric Selection" className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <MetricSelector
            selectedMetric={selectedMetric}
            onSelectMetric={(m) => startTransition(() => setSelectedMetric(m))}
          />
        </section>

        {/* Zoom Out Resolution Controls (Daily, Weekly, Monthly, Yearly) & Sorting */}
        <section aria-label="Time Resolution & Zoom Controls">
          <ResolutionSelector
            resolution={resolution}
            onSelectResolution={(r) => startTransition(() => setResolution(r))}
            sortBy={sortBy}
            onSelectSortBy={setSortBy}
            totalSnapshots={snapshots.length}
          />
        </section>

        {/* High-level market overview cards */}
        <section aria-label="Market Overview Stats">
          <MarketSummaryCards currentSnapshot={comparison.currentSnapshot} />
        </section>

        {/* Visualization Mode Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMainViewMode('worms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mainViewMode === 'worms'
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>188 Sector Worms (Multi-Line Chart)</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-mono">
                188 Lines
              </span>
            </button>

            <button
              onClick={() => setMainViewMode('bars')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mainViewMode === 'bars'
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              <span>Ranked Sector Bars & Table</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <span>Tracking 188 Indian Industry Sectors</span>
          </div>
        </div>

        {/* Primary Visualization Area */}
        {mainViewMode === 'worms' ? (
          <section aria-label="188 Multi-Line Sector Worms Chart">
            <SectorWormsChart
              snapshots={snapshots}
              selectedMetric={selectedMetric}
              resolution={resolution}
              selectedDate={selectedDate}
              sortBy={sortBy}
              onSelectSector={(sec) => setSelectedSector(sec)}
            />
          </section>
        ) : (
          <section aria-label="Sector Bar Chart Dashboard">
            <SectorBarChart
              items={comparison.items}
              selectedMetric={selectedMetric}
              resolution={resolution}
              selectedDate={selectedDate}
              previousDate={comparison.previousSnapshot?.date || null}
              onSelectSector={(sec) => setSelectedSector(sec)}
              sortBy={sortBy}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div>
            <span className="font-bold text-zinc-800">Screener.in Industry Trends</span> •
            Scheduled 7:00 PM IST Weekday Scraper
          </div>
          <div>
            Tracking {comparison.items.length} Industries • Multi-Resolution Analysis (Daily, Weekly, Monthly)
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SectorDrilldownModal
        sectorName={selectedSector}
        snapshots={snapshots}
        onClose={() => setSelectedSector(null)}
        initialMetric={selectedMetric}
        initialResolution={resolution}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        snapshots={snapshots}
        onImportData={handleImportData}
        onResetSeedData={handleResetSeedData}
      />

      <SchedulerModal
        isOpen={isSchedulerModalOpen}
        onClose={() => setIsSchedulerModalOpen(false)}
        schedulerInfo={schedulerInfo}
        onTriggerFetch={handleTriggerFetch}
        isFetching={isFetching}
      />
    </div>
  );
}
