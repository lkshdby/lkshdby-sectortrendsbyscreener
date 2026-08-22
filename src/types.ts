export type MetricKey =
  | 'noOfCompanies'
  | 'totalMarketCap'
  | 'medianMarketCap'
  | 'medianPE'
  | 'wtdAvgSalesGrowth'
  | 'wtdAvgOPM'
  | 'wtdAvgROCE'
  | 'median1YReturn';

export interface MetricDefinition {
  id: MetricKey;
  label: string;
  shortLabel: string;
  unit: string;
  format: (val: number) => string;
  formatDelta: (val: number, pct: number) => string;
  description: string;
  higherIsBetter?: boolean;
}

export interface SectorDataPoint {
  sector: string;
  noOfCompanies: number;
  totalMarketCap: number; // in Cr (₹)
  medianMarketCap: number; // in Cr (₹)
  medianPE: number;
  wtdAvgSalesGrowth: number; // %
  wtdAvgOPM: number; // %
  wtdAvgROCE: number; // %
  median1YReturn: number; // %
}

export interface DailySnapshot {
  date: string; // YYYY-MM-DD
  timestamp: number;
  sectors: SectorDataPoint[];
  fetchedAt: string;
  source?: string;
}

export type TimeResolution = 'daily' | 'weekly' | 'monthly';

export interface SchedulerInfo {
  isActive: boolean;
  schedule: string; // e.g. "0 19 * * 1-5 (7:00 PM IST, Mon-Fri)"
  timezone: string;
  lastRunTime: string | null;
  nextRunTime: string;
  status: 'idle' | 'running' | 'success' | 'error';
  log: string[];
  totalDaysStored: number;
  oldestDate?: string;
  newestDate?: string;
}

export interface SectorComparisonItem {
  sector: string;
  currentValue: number;
  previousValue: number | null;
  changeValue: number;
  changePercent: number;
  history: { date: string; value: number }[];
  allMetrics: SectorDataPoint;
}
