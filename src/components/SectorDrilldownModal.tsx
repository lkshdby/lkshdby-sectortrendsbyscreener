import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Calendar,
  Layers,
  TrendingUp,
  X,
} from 'lucide-react';
import { DailySnapshot, MetricKey, TimeResolution } from '../types';
import { METRIC_DEFINITIONS, METRIC_KEYS } from '../utils/metrics';
import { getSnapshotsByResolution } from '../utils/dataProcessor';

interface SectorDrilldownModalProps {
  sectorName: string | null;
  snapshots: DailySnapshot[];
  onClose: () => void;
  initialMetric: MetricKey;
  initialResolution: TimeResolution;
}

export const SectorDrilldownModal: React.FC<SectorDrilldownModalProps> = ({
  sectorName,
  snapshots,
  onClose,
  initialMetric,
  initialResolution,
}) => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>(initialMetric);
  const [activeResolution, setActiveResolution] = useState<TimeResolution>(initialResolution);

  if (!sectorName) return null;

  const resolutionSnapshots = getSnapshotsByResolution(snapshots, activeResolution);
  const metricDef = METRIC_DEFINITIONS[activeMetric];

  // Build time-series data for this sector
  const chartData = resolutionSnapshots
    .map((snap) => {
      const s = snap.sectors.find((item) => item.sector === sectorName);
      if (!s) return null;
      return {
        date: snap.date,
        value: s[activeMetric] as number,
        noOfCompanies: s.noOfCompanies,
        pe: s.medianPE,
        marketCap: s.totalMarketCap,
        salesGrowth: s.wtdAvgSalesGrowth,
        opm: s.wtdAvgOPM,
        roce: s.wtdAvgROCE,
        return1Y: s.median1YReturn,
      };
    })
    .filter(Boolean) as {
    date: string;
    value: number;
    noOfCompanies: number;
    pe: number;
    marketCap: number;
    salesGrowth: number;
    opm: number;
    roce: number;
    return1Y: number;
  }[];

  const firstPoint = chartData[0];
  const latestPoint = chartData[chartData.length - 1];
  const totalChange = latestPoint && firstPoint ? latestPoint.value - firstPoint.value : 0;
  const totalPct = firstPoint && firstPoint.value !== 0 ? (totalChange / Math.abs(firstPoint.value)) * 100 : 0;
  const isPositive = totalChange >= 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-zinc-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-zinc-900 text-white">
                <Building2 className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-zinc-900">{sectorName}</h3>
              <span className="text-xs bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md font-medium">
                {latestPoint?.noOfCompanies || 0} Listed Companies
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Historical performance evolution across {chartData.length} records ({firstPoint?.date} to {latestPoint?.date})
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-200/80 hover:bg-zinc-300 flex items-center justify-center text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Quick Metrics Bar for this Sector */}
          {latestPoint && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-xs">
              <div>
                <span className="text-zinc-500">Current {metricDef.label}:</span>
                <div className="text-sm font-bold text-zinc-900 mt-0.5">
                  {metricDef.format(latestPoint.value)}
                </div>
              </div>
              <div>
                <span className="text-zinc-500">Net Period Shift:</span>
                <div
                  className={`text-sm font-bold flex items-center gap-0.5 mt-0.5 ${
                    isPositive ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {isPositive ? '+' : ''}
                  {totalPct.toFixed(1)}% ({metricDef.formatDelta(totalChange, totalPct)})
                </div>
              </div>
              <div>
                <span className="text-zinc-500">Median P/E:</span>
                <div className="text-sm font-bold text-zinc-900 mt-0.5">{latestPoint.pe}x</div>
              </div>
              <div>
                <span className="text-zinc-500">1Y Return:</span>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    latestPoint.return1Y >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {latestPoint.return1Y >= 0 ? '+' : ''}
                  {latestPoint.return1Y}%
                </div>
              </div>
            </div>
          )}

          {/* Metric Selector Pills inside modal */}
          <div>
            <div className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
              Change Active Metric:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {METRIC_KEYS.map((key) => {
                const def = METRIC_DEFINITIONS[key];
                const isSel = activeMetric === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveMetric(key)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                      isSel
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {def.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resolution Selector inside modal */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Aggregation Level:</span>
            <div className="inline-flex p-0.5 bg-zinc-100 rounded-lg gap-1">
              {(['daily', 'weekly', 'monthly'] as TimeResolution[]).map((res) => (
                <button
                  key={res}
                  onClick={() => setActiveResolution(res)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                    activeResolution === res
                      ? 'bg-white text-zinc-900 shadow-2xs font-bold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Main Area Chart */}
          <div
            className="w-full overflow-x-auto pb-2 touch-pan-x overscroll-x-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div style={{ minWidth: '480px', height: '288px' }} className="w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#047857" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    tickFormatter={(val) => {
                      if (activeResolution === 'monthly') return val.substring(0, 7);
                      return val.substring(5);
                    }}
                  />
                  <YAxis
                    tickFormatter={(val) => metricDef.format(val)}
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    formatter={(val: any) => [metricDef.format(val), metricDef.label]}
                    labelFormatter={(lbl) => `Date: ${lbl}`}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#047857"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorVal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end">
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
