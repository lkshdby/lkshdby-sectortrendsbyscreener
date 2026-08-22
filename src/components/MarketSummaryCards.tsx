import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Percent,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DailySnapshot } from '../types';
import { computeMarketOverview } from '../utils/dataProcessor';
import { formatIndianCurrency } from '../utils/metrics';

interface MarketSummaryCardsProps {
  currentSnapshot: DailySnapshot | null;
}

export const MarketSummaryCards: React.FC<MarketSummaryCardsProps> = ({
  currentSnapshot,
}) => {
  const overview = computeMarketOverview(currentSnapshot);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total Market Cap */}
      <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Total Market Cap</span>
          <Coins className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <div className="text-base sm:text-lg font-bold text-zinc-900">
          {formatIndianCurrency(overview.totalMarketCap)}
        </div>
        <div className="text-[11px] text-zinc-500 mt-0.5">
          Across {overview.totalCompanies} Listed Companies
        </div>
      </div>

      {/* Weighted Average P/E */}
      <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Wtd. Market P/E</span>
          <Percent className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <div className="text-base sm:text-lg font-bold text-zinc-900">
          {overview.averagePE.toFixed(1)}x
        </div>
        <div className="text-[11px] text-zinc-500 mt-0.5">
          Avg ROCE: {overview.averageROCE.toFixed(1)}%
        </div>
      </div>

      {/* Top 1Y Return Sector */}
      <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Top 1Y Outperformer</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
          {overview.topGainerSector?.sector || '-'}
        </div>
        <div className="text-[11px] font-semibold text-emerald-700 mt-0.5 flex items-center gap-0.5">
          <ArrowUpRight className="w-3 h-3" />
          +{overview.topGainerSector?.median1YReturn}% 1Y Median Return
        </div>
      </div>

      {/* Market Avg Sales Growth & OPM */}
      <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Operating Metrics</span>
          <Users className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <div className="text-base sm:text-lg font-bold text-zinc-900">
          {overview.averageOPM.toFixed(1)}% OPM
        </div>
        <div className="text-[11px] text-zinc-500 mt-0.5">
          Wtd. Sales Growth: {overview.averageSalesGrowth.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};
