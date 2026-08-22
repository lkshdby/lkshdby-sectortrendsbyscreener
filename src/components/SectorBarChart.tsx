import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ExternalLink,
  Search,
  Table as TableIcon,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { MetricKey, SectorComparisonItem, TimeResolution } from '../types';
import { METRIC_DEFINITIONS } from '../utils/metrics';

interface SectorBarChartProps {
  items: SectorComparisonItem[];
  selectedMetric: MetricKey;
  resolution: TimeResolution;
  selectedDate: string;
  previousDate: string | null;
  onSelectSector: (sectorName: string) => void;
  sortBy: 'value-desc' | 'value-asc' | 'change-desc' | 'change-asc' | 'alphabetical';
}

export const SectorBarChart: React.FC<SectorBarChartProps> = ({
  items,
  selectedMetric,
  resolution,
  selectedDate,
  previousDate,
  onSelectSector,
  sortBy,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState<'30' | '60' | '100' | 'all'>('all');
  const metricDef = METRIC_DEFINITIONS[selectedMetric];

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => item.sector.toLowerCase().includes(q));
  }, [items, searchQuery]);

  // Sort items according to user preference
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    return list.sort((a, b) => {
      if (sortBy === 'value-desc') return b.currentValue - a.currentValue;
      if (sortBy === 'value-asc') return a.currentValue - b.currentValue;
      if (sortBy === 'change-desc') return b.changePercent - a.changePercent;
      if (sortBy === 'change-asc') return a.changePercent - b.changePercent;
      if (sortBy === 'alphabetical') return a.sector.localeCompare(b.sector);
      return 0;
    });
  }, [filteredItems, sortBy]);

  // Display items based on slice limit
  const visibleItems = useMemo(() => {
    if (displayCount === 'all') return sortedItems;
    const limit = parseInt(displayCount, 10);
    return sortedItems.slice(0, limit);
  }, [sortedItems, displayCount]);

  // Calculate min, max, average across the full dataset
  const values = items.map((i) => i.currentValue);
  const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  // Format resolution comparison label
  const resolutionLabels: Record<TimeResolution, string> = {
    daily: 'Day-on-Day (1 Day)',
    weekly: 'Week-on-Week (1 Wk)',
    monthly: 'Month-on-Month (1 Mo)',
  };

  // Recharts custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: SectorComparisonItem = payload[0].payload;
      const isPositiveChange = data.changeValue >= 0;

      return (
        <div className="bg-zinc-900 text-white p-3.5 rounded-xl shadow-xl border border-zinc-800 text-xs min-w-[260px] z-50">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
            <span className="font-bold text-sm text-zinc-100">{data.sector}</span>
            <span className="text-[10px] text-zinc-400 font-mono">
              {data.allMetrics.noOfCompanies} companies
            </span>
          </div>

          <div className="space-y-1.5 mb-2.5">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">{metricDef.label}:</span>
              <span className="font-bold text-white text-sm">
                {metricDef.format(data.currentValue)}
              </span>
            </div>

            {data.previousValue !== null && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Change ({resolutionLabels[resolution]}):</span>
                <span
                  className={`font-semibold flex items-center gap-0.5 ${
                    isPositiveChange ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositiveChange ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {metricDef.formatDelta(data.changeValue, data.changePercent)}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-zinc-300">
            <div>
              <span className="text-zinc-400">P/E: </span>
              <span className="font-semibold">{data.allMetrics.medianPE}x</span>
            </div>
            <div>
              <span className="text-zinc-400">1Y Return: </span>
              <span
                className={`font-semibold ${
                  data.allMetrics.median1YReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {data.allMetrics.median1YReturn >= 0 ? '+' : ''}
                {data.allMetrics.median1YReturn}%
              </span>
            </div>
            <div>
              <span className="text-zinc-400">ROCE: </span>
              <span className="font-semibold">{data.allMetrics.wtdAvgROCE}%</span>
            </div>
            <div>
              <span className="text-zinc-400">OPM: </span>
              <span className="font-semibold">{data.allMetrics.wtdAvgOPM}%</span>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-zinc-400 italic text-center bg-zinc-800/50 py-1 rounded">
            Click bar to open multi-year historical trend chart
          </div>
        </div>
      );
    }
    return null;
  };

  // Dynamic height for the horizontal bar chart
  const calculatedHeight = Math.max(500, visibleItems.length * 28 + 80);

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Chart Header Bar */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-zinc-50/50">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-zinc-900">
              Sector Comparison: {metricDef.label}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
              {items.length} Industry Sectors
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-700 font-medium">
              {resolutionLabels[resolution]}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            X-Axis: <span className="font-semibold text-zinc-700">{metricDef.label} ({metricDef.unit || 'Count'})</span> • Y-Axis: <span className="font-semibold text-zinc-700">Industry / Sector</span> • Baseline:{' '}
            {previousDate ? previousDate : 'Initial'} → {selectedDate}
          </p>
        </div>

        {/* Controls: Search, Limit, View Mode */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={`Search ${items.length} sectors...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-44 sm:w-56"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Display Limit Selector */}
          {viewMode === 'chart' && (
            <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-lg p-0.5 text-xs">
              {(['30', '60', '100', 'all'] as const).map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setDisplayCount(cnt)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    displayCount === cnt
                      ? 'bg-white text-zinc-900 font-bold shadow-2xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {cnt === 'all' ? `All (${items.length})` : `Top ${cnt}`}
                </button>
              ))}
            </div>
          )}

          {/* View Toggle */}
          <div className="flex items-center bg-zinc-200/80 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'chart'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Chart</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'chart' ? (
        <div className="p-4 sm:p-6">
          {/* Legend & Stats Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs">
            <div>
              <span className="text-zinc-500 font-medium">Top Industry:</span>
              <div className="font-bold text-zinc-900 truncate">
                {sortedItems[0]?.sector || '-'} ({metricDef.format(sortedItems[0]?.currentValue || 0)})
              </div>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Lowest Industry:</span>
              <div className="font-bold text-zinc-900 truncate">
                {sortedItems[sortedItems.length - 1]?.sector || '-'} (
                {metricDef.format(sortedItems[sortedItems.length - 1]?.currentValue || 0)})
              </div>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Industry Average:</span>
              <div className="font-bold text-zinc-900">{metricDef.format(avgValue)}</div>
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Showing:</span>
              <div className="font-bold text-emerald-700">
                {visibleItems.length} of {items.length} Industries
              </div>
            </div>
          </div>

          {/* Mobile Swipe Hint for Bar Chart */}
          <div className="sm:hidden mb-3 px-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-between text-[11px] text-zinc-700 font-medium">
            <span className="flex items-center gap-1">
              <span>↔</span> Swipe horizontally to view full sector labels & bar values
            </span>
          </div>

          {/* Full Page Horizontal Bar Chart (Y = Sector, X = Value) - Scrollable on mobile */}
          <div
            className="w-full overflow-x-auto pb-3 touch-pan-x overscroll-x-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div style={{ height: calculatedHeight, minWidth: '620px' }} className="w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visibleItems}
                  layout="vertical"
                  margin={{ top: 10, right: 90, left: 175, bottom: 25 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length) {
                      onSelectSector(e.activePayload[0].payload.sector);
                    }
                  }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v) => metricDef.format(v)}
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    axisLine={{ stroke: '#e4e4e7' }}
                    tickLine={{ stroke: '#e4e4e7' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="sector"
                    tick={{ fontSize: 11, fill: '#18181b', fontWeight: 500 }}
                    width={170}
                    axisLine={{ stroke: '#e4e4e7' }}
                    tickLine={false}
                    interval={0}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                  <ReferenceLine
                    x={avgValue}
                    stroke="#a1a1aa"
                    strokeDasharray="3 3"
                    label={{
                      value: `Avg: ${metricDef.format(avgValue)}`,
                      position: 'top',
                      fill: '#71717a',
                      fontSize: 10,
                    }}
                  />
                  <Bar
                    dataKey="currentValue"
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={false}
                    className="cursor-pointer"
                  >
                    {visibleItems.map((entry, index) => {
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            selectedMetric === 'median1YReturn' || selectedMetric === 'wtdAvgSalesGrowth'
                              ? entry.currentValue >= 0
                                ? '#047857' // emerald-700
                                : '#be123c' // rose-700
                              : '#0f172a' // zinc-900 slate
                          }
                          className="hover:opacity-80 transition-opacity"
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Sector Grid */}
          <div className="mt-8 border-t border-zinc-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                All {sortedItems.length} Industries (Click to Drilldown)
              </span>
              <span className="text-[11px] text-zinc-500">
                Sorted by {sortBy.replace('-', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {sortedItems.map((item) => {
                const isPositive = item.changeValue >= 0;
                return (
                  <button
                    key={item.sector}
                    onClick={() => onSelectSector(item.sector)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 hover:border-emerald-600 hover:bg-emerald-50/30 transition-all text-left group bg-white shadow-2xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-zinc-900 group-hover:text-emerald-800 truncate">
                        {item.sector}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {item.allMetrics.noOfCompanies} cos • P/E: {item.allMetrics.medianPE}x
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-zinc-900">
                        {metricDef.format(item.currentValue)}
                      </div>
                      {item.previousValue !== null ? (
                        <div
                          className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                            isPositive ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-2.5 h-2.5" />
                          ) : (
                            <TrendingDown className="w-2.5 h-2.5" />
                          )}
                          {isPositive ? '+' : ''}
                          {item.changePercent.toFixed(1)}%
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-400">Baseline</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Screener.in /market/ Exact Data Table View */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-bold">
                <th className="py-3 px-3">S.No.</th>
                <th className="py-3 px-4">Industry Sector</th>
                <th className="py-3 px-3 text-right">No. of Companies</th>
                <th className="py-3 px-4 text-right">Total Market Cap</th>
                <th className="py-3 px-4 text-right">Median Market Cap</th>
                <th className="py-3 px-3 text-right">Median P/E</th>
                <th className="py-3 px-3 text-right">Wtd. Sales Growth</th>
                <th className="py-3 px-3 text-right">Wtd. OPM</th>
                <th className="py-3 px-3 text-right">Wtd. ROCE</th>
                <th className="py-3 px-3 text-right">Median 1Y Return</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {sortedItems.map((item, idx) => {
                const s = item.allMetrics;
                return (
                  <tr
                    key={item.sector}
                    className="hover:bg-zinc-50 transition-colors cursor-pointer"
                    onClick={() => onSelectSector(item.sector)}
                  >
                    <td className="py-2.5 px-3 font-mono text-zinc-400">{idx + 1}.</td>
                    <td className="py-2.5 px-4 font-bold text-zinc-900">{s.sector}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{s.noOfCompanies}</td>
                    <td className="py-2.5 px-4 text-right font-semibold">
                      ₹{s.totalMarketCap.toLocaleString('en-IN')} Cr
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium">
                      ₹{s.medianMarketCap.toLocaleString('en-IN')} Cr
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">{s.medianPE}x</td>
                    <td className="py-2.5 px-3 text-right font-medium">{s.wtdAvgSalesGrowth}%</td>
                    <td className="py-2.5 px-3 text-right font-medium">{s.wtdAvgOPM}%</td>
                    <td className="py-2.5 px-3 text-right font-medium">{s.wtdAvgROCE}%</td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        s.median1YReturn >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {s.median1YReturn >= 0 ? '+' : ''}
                      {s.median1YReturn}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold">
                        Drilldown <ExternalLink className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
