import { DailySnapshot, SectorDataPoint } from '../types';

export const SECTOR_DEFINITIONS: {
  name: string;
  baseCompanies: number;
  baseMarketCap: number; // in Cr
  baseMedianCap: number; // in Cr
  basePE: number;
  baseSalesGrowth: number;
  baseOPM: number;
  baseROCE: number;
  base1YReturn: number;
  volatility: number;
}[] = [
  {
    name: 'Information Technology',
    baseCompanies: 284,
    baseMarketCap: 3850000,
    baseMedianCap: 2150,
    basePE: 29.4,
    baseSalesGrowth: 8.8,
    baseOPM: 22.5,
    baseROCE: 28.2,
    base1YReturn: 18.5,
    volatility: 0.012,
  },
  {
    name: 'Private Sector Banks',
    baseCompanies: 22,
    baseMarketCap: 3420000,
    baseMedianCap: 45000,
    basePE: 16.8,
    baseSalesGrowth: 15.2,
    baseOPM: 19.4,
    baseROCE: 14.8,
    base1YReturn: 14.2,
    volatility: 0.014,
  },
  {
    name: 'Oil, Gas & Fuels',
    baseCompanies: 45,
    baseMarketCap: 2680000,
    baseMedianCap: 12400,
    basePE: 13.5,
    baseSalesGrowth: 6.4,
    baseOPM: 14.2,
    baseROCE: 16.5,
    base1YReturn: 28.4,
    volatility: 0.016,
  },
  {
    name: 'FMCG',
    baseCompanies: 196,
    baseMarketCap: 2310000,
    baseMedianCap: 1890,
    basePE: 44.6,
    baseSalesGrowth: 9.1,
    baseOPM: 24.8,
    baseROCE: 32.4,
    base1YReturn: 11.2,
    volatility: 0.008,
  },
  {
    name: 'Automobiles & OEMs',
    baseCompanies: 38,
    baseMarketCap: 1950000,
    baseMedianCap: 8600,
    basePE: 24.2,
    baseSalesGrowth: 13.6,
    baseOPM: 14.5,
    baseROCE: 19.8,
    base1YReturn: 42.6,
    volatility: 0.018,
  },
  {
    name: 'Pharmaceuticals & Drugs',
    baseCompanies: 245,
    baseMarketCap: 1820000,
    baseMedianCap: 1420,
    basePE: 33.8,
    baseSalesGrowth: 12.4,
    baseOPM: 21.2,
    baseROCE: 17.6,
    base1YReturn: 36.5,
    volatility: 0.011,
  },
  {
    name: 'Finance - NBFC & Housing',
    baseCompanies: 210,
    baseMarketCap: 1750000,
    baseMedianCap: 940,
    basePE: 19.2,
    baseSalesGrowth: 18.5,
    baseOPM: 26.4,
    baseROCE: 15.2,
    base1YReturn: 21.8,
    volatility: 0.015,
  },
  {
    name: 'Power & Renewable Energy',
    baseCompanies: 78,
    baseMarketCap: 1640000,
    baseMedianCap: 3800,
    basePE: 27.5,
    baseSalesGrowth: 14.2,
    baseOPM: 28.5,
    baseROCE: 13.9,
    base1YReturn: 54.2,
    volatility: 0.022,
  },
  {
    name: 'Metals & Mining',
    baseCompanies: 156,
    baseMarketCap: 1480000,
    baseMedianCap: 880,
    basePE: 14.2,
    baseSalesGrowth: 4.8,
    baseOPM: 16.8,
    baseROCE: 14.1,
    base1YReturn: 24.1,
    volatility: 0.024,
  },
  {
    name: 'Capital Goods & Engineering',
    baseCompanies: 312,
    baseMarketCap: 1390000,
    baseMedianCap: 640,
    basePE: 41.5,
    baseSalesGrowth: 17.8,
    baseOPM: 13.9,
    baseROCE: 18.4,
    base1YReturn: 49.3,
    volatility: 0.02,
  },
  {
    name: 'Public Sector Banks',
    baseCompanies: 14,
    baseMarketCap: 1320000,
    baseMedianCap: 48000,
    basePE: 8.9,
    baseSalesGrowth: 16.4,
    baseOPM: 17.2,
    baseROCE: 13.1,
    base1YReturn: 38.9,
    volatility: 0.019,
  },
  {
    name: 'Speciality Chemicals',
    baseCompanies: 218,
    baseMarketCap: 1120000,
    baseMedianCap: 790,
    basePE: 36.4,
    baseSalesGrowth: 3.2,
    baseOPM: 18.1,
    baseROCE: 14.5,
    base1YReturn: 7.8,
    volatility: 0.016,
  },
  {
    name: 'Telecommunication Services',
    baseCompanies: 28,
    baseMarketCap: 1080000,
    baseMedianCap: 2400,
    basePE: 48.2,
    baseSalesGrowth: 11.5,
    baseOPM: 46.2,
    baseROCE: 11.8,
    base1YReturn: 51.2,
    volatility: 0.017,
  },
  {
    name: 'Auto Ancillaries & Parts',
    baseCompanies: 235,
    baseMarketCap: 940000,
    baseMedianCap: 810,
    basePE: 28.6,
    baseSalesGrowth: 12.1,
    baseOPM: 14.8,
    baseROCE: 16.9,
    base1YReturn: 31.4,
    volatility: 0.015,
  },
  {
    name: 'Real Estate & Construction',
    baseCompanies: 142,
    baseMarketCap: 860000,
    baseMedianCap: 1150,
    basePE: 38.2,
    baseSalesGrowth: 21.4,
    baseOPM: 25.1,
    baseROCE: 12.4,
    base1YReturn: 68.4,
    volatility: 0.026,
  },
  {
    name: 'Healthcare & Hospitals',
    baseCompanies: 95,
    baseMarketCap: 740000,
    baseMedianCap: 1600,
    basePE: 42.1,
    baseSalesGrowth: 14.8,
    baseOPM: 20.8,
    baseROCE: 15.6,
    base1YReturn: 34.2,
    volatility: 0.013,
  },
  {
    name: 'Consumer Durables',
    baseCompanies: 118,
    baseMarketCap: 680000,
    baseMedianCap: 1020,
    basePE: 46.8,
    baseSalesGrowth: 10.2,
    baseOPM: 11.4,
    baseROCE: 17.2,
    base1YReturn: 22.5,
    volatility: 0.018,
  },
  {
    name: 'Cement & Building Materials',
    baseCompanies: 64,
    baseMarketCap: 620000,
    baseMedianCap: 1450,
    basePE: 26.5,
    baseSalesGrowth: 7.9,
    baseOPM: 16.5,
    baseROCE: 13.8,
    base1YReturn: 19.4,
    volatility: 0.016,
  },
  {
    name: 'Logistics & Supply Chain',
    baseCompanies: 88,
    baseMarketCap: 490000,
    baseMedianCap: 680,
    basePE: 31.2,
    baseSalesGrowth: 11.8,
    baseOPM: 13.5,
    baseROCE: 14.9,
    base1YReturn: 27.6,
    volatility: 0.019,
  },
  {
    name: 'Textiles & Apparels',
    baseCompanies: 260,
    baseMarketCap: 380000,
    baseMedianCap: 290,
    basePE: 22.4,
    baseSalesGrowth: 6.2,
    baseOPM: 12.6,
    baseROCE: 12.1,
    base1YReturn: 15.8,
    volatility: 0.017,
  },
];

// Helper to generate deterministically seeded historical snapshots
export function generateHistoricalSeedSnapshots(startDateStr = '2025-08-20', endDateStr = '2026-08-22'): DailySnapshot[] {
  const snapshots: DailySnapshot[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const cur = new Date(start);
  let dayIndex = 0;

  // Track progressive walk for sectors
  const sectorDrift: Record<string, number> = {};
  SECTOR_DEFINITIONS.forEach((s) => {
    sectorDrift[s.name] = 1.0;
  });

  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    // Leave Sat (6) and Sun (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = cur.toISOString().split('T')[0];
      
      const sectors: SectorDataPoint[] = SECTOR_DEFINITIONS.map((def) => {
        // Deterministic pseudo-random variation based on date and sector
        const seed = Math.sin(dayIndex * 13 + def.name.length * 7) * 10000;
        const rand = seed - Math.floor(seed);
        const dayDrift = (rand - 0.485) * def.volatility;
        
        sectorDrift[def.name] = Math.max(0.7, sectorDrift[def.name] * (1 + dayDrift));
        const factor = sectorDrift[def.name];

        const totalMarketCap = Math.round(def.baseMarketCap * factor);
        const medianMarketCap = Math.round(def.baseMedianCap * factor);
        const medianPE = parseFloat((def.basePE * (0.9 + 0.2 * factor)).toFixed(2));
        const wtdAvgSalesGrowth = parseFloat((def.baseSalesGrowth + (rand - 0.5) * 1.5).toFixed(2));
        const wtdAvgOPM = parseFloat((def.baseOPM + (rand - 0.5) * 1.2).toFixed(2));
        const wtdAvgROCE = parseFloat((def.baseROCE + (rand - 0.5) * 1.0).toFixed(2));
        const median1YReturn = parseFloat((def.base1YReturn * factor + (rand - 0.5) * 2).toFixed(2));

        return {
          sector: def.name,
          noOfCompanies: def.baseCompanies + (dayIndex > 100 ? (def.name.charCodeAt(0) % 3) : 0),
          totalMarketCap,
          medianMarketCap,
          medianPE,
          wtdAvgSalesGrowth,
          wtdAvgOPM,
          wtdAvgROCE,
          median1YReturn,
        };
      });

      snapshots.push({
        date: dateStr,
        timestamp: new Date(`${dateStr}T19:00:00+05:30`).getTime(),
        sectors,
        fetchedAt: `${dateStr}T19:00:00.000+05:30`,
        source: 'Screener.in Sector Feed (Scheduled 7:00 PM IST)',
      });
      dayIndex++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return snapshots;
}
