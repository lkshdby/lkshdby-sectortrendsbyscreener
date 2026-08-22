import { MetricDefinition, MetricKey } from '../types';

export function formatIndianCurrency(cr: number): string {
  if (cr >= 100000) {
    return `₹${(cr / 100000).toFixed(2)}L Cr`;
  }
  if (cr >= 1000) {
    return `₹${(cr / 1000).toFixed(1)}k Cr`;
  }
  return `₹${cr.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
}

export const METRIC_DEFINITIONS: Record<MetricKey, MetricDefinition> = {
  noOfCompanies: {
    id: 'noOfCompanies',
    label: 'No. of Companies',
    shortLabel: 'Companies',
    unit: '',
    format: (val: number) => Math.round(val).toLocaleString('en-IN'),
    formatDelta: (val: number, pct: number) => {
      const sign = val > 0 ? '+' : '';
      return `${sign}${Math.round(val)}`;
    },
    description: 'Total number of listed companies classified in this sector',
  },
  totalMarketCap: {
    id: 'totalMarketCap',
    label: 'Total Market Cap.',
    shortLabel: 'Total MCap',
    unit: '₹ Cr',
    format: (val: number) => formatIndianCurrency(val),
    formatDelta: (val: number, pct: number) => {
      const sign = pct > 0 ? '+' : '';
      return `${sign}${pct.toFixed(2)}% (${formatIndianCurrency(val)})`;
    },
    description: 'Aggregate market capitalization of all companies in this sector',
    higherIsBetter: true,
  },
  medianMarketCap: {
    id: 'medianMarketCap',
    label: 'Median Market Cap.',
    shortLabel: 'Median MCap',
    unit: '₹ Cr',
    format: (val: number) => formatIndianCurrency(val),
    formatDelta: (val: number, pct: number) => {
      const sign = pct > 0 ? '+' : '';
      return `${sign}${pct.toFixed(2)}% (${formatIndianCurrency(val)})`;
    },
    description: 'Median market capitalization representing the typical firm size in this sector',
  },
  medianPE: {
    id: 'medianPE',
    label: 'Median P/E',
    shortLabel: 'Median P/E',
    unit: 'x',
    format: (val: number) => `${val.toFixed(2)}x`,
    formatDelta: (val: number, pct: number) => {
      const sign = val > 0 ? '+' : '';
      return `${sign}${val.toFixed(2)}x (${pct > 0 ? '+' : ''}${pct.toFixed(1)}%)`;
    },
    description: 'Median Price to Earnings multiple valuation for the sector',
  },
  wtdAvgSalesGrowth: {
    id: 'wtdAvgSalesGrowth',
    label: 'Wtd. Avg Sales Growth',
    shortLabel: 'Sales Growth',
    unit: '%',
    format: (val: number) => `${val >= 0 ? '' : ''}${val.toFixed(2)}%`,
    formatDelta: (val: number, pct: number) => {
      const sign = val > 0 ? '+' : '';
      return `${sign}${val.toFixed(2)}% pts`;
    },
    description: 'Market-cap weighted average sales revenue growth year-on-year',
    higherIsBetter: true,
  },
  wtdAvgOPM: {
    id: 'wtdAvgOPM',
    label: 'Wtd. Avg OPM',
    shortLabel: 'OPM',
    unit: '%',
    format: (val: number) => `${val.toFixed(2)}%`,
    formatDelta: (val: number, pct: number) => {
      const sign = val > 0 ? '+' : '';
      return `${sign}${val.toFixed(2)}% pts`;
    },
    description: 'Market-cap weighted Operating Profit Margin (OPM)',
    higherIsBetter: true,
  },
  wtdAvgROCE: {
    id: 'wtdAvgROCE',
    label: 'Wtd. Avg ROCE',
    shortLabel: 'ROCE',
    unit: '%',
    format: (val: number) => `${val.toFixed(2)}%`,
    formatDelta: (val: number, pct: number) => {
      const sign = val > 0 ? '+' : '';
      return `${sign}${val.toFixed(2)}% pts`;
    },
    description: 'Market-cap weighted Return on Capital Employed (ROCE)',
    higherIsBetter: true,
  },
  median1YReturn: {
    id: 'median1YReturn',
    label: 'Median 1Y Return',
    shortLabel: '1Y Return',
    unit: '%',
    format: (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`,
    formatDelta: (val: number, pct: number) => {
      const sign = val > 0 ? '+' : '';
      return `${sign}${val.toFixed(2)}% pts`;
    },
    description: 'Median trailing 1-year stock price return across sector stocks',
    higherIsBetter: true,
  },
};

export const METRIC_KEYS: MetricKey[] = [
  'noOfCompanies',
  'totalMarketCap',
  'medianMarketCap',
  'medianPE',
  'wtdAvgSalesGrowth',
  'wtdAvgOPM',
  'wtdAvgROCE',
  'median1YReturn',
];
