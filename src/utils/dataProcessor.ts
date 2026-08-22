import { DailySnapshot, MetricKey, SectorComparisonItem, SectorDataPoint, TimeResolution } from '../types';

export function getSortedSnapshots(snapshots: DailySnapshot[]): DailySnapshot[] {
  return [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Filter and group snapshots based on the selected time resolution:
 * - Daily: All weekday snapshots
 * - Weekly: Friday / week-ending snapshots (or one per week)
 * - Monthly: Month-end snapshots (last available trading day of each month)
 */
export function getSnapshotsByResolution(
  snapshots: DailySnapshot[],
  resolution: TimeResolution
): DailySnapshot[] {
  const sorted = getSortedSnapshots(snapshots);
  if (sorted.length === 0) return [];

  if (resolution === 'daily') {
    return sorted;
  }

  if (resolution === 'weekly') {
    // Group by Year-Week (e.g. 2026-W08)
    const weekMap = new Map<string, DailySnapshot>();
    sorted.forEach((snap) => {
      const d = new Date(snap.date);
      const year = d.getFullYear();
      // Simple week number calculation
      const startOfYear = new Date(year, 0, 1);
      const pastDaysOfYear = (d.getTime() - startOfYear.getTime()) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
      const weekKey = `${year}-W${String(weekNum).padStart(2, '0')}`;
      
      // Store latest day of each week
      weekMap.set(weekKey, snap);
    });
    return Array.from(weekMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  if (resolution === 'monthly') {
    // Group by Year-Month (e.g. 2026-08)
    const monthMap = new Map<string, DailySnapshot>();
    sorted.forEach((snap) => {
      const monthKey = snap.date.substring(0, 7);
      monthMap.set(monthKey, snap); // will overwrite so last day of month remains
    });
    return Array.from(monthMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  return sorted;
}

/**
 * Filter snapshots up to a selected date (inclusive)
 */
export function getSnapshotsUpToDate(
  snapshots: DailySnapshot[],
  targetDateStr: string
): DailySnapshot[] {
  const sorted = getSortedSnapshots(snapshots);
  if (!targetDateStr) return sorted;
  const filtered = sorted.filter((s) => s.date <= targetDateStr);
  return filtered.length > 0 ? filtered : sorted.slice(0, 1);
}

/**
 * Builds sector comparison items for a target snapshot compared against previous period
 */
export function computeSectorComparison(
  allSnapshots: DailySnapshot[],
  targetDateStr: string,
  metric: MetricKey,
  resolution: TimeResolution
): {
  items: SectorComparisonItem[];
  currentSnapshot: DailySnapshot | null;
  previousSnapshot: DailySnapshot | null;
} {
  const sortedSnapshots = getSortedSnapshots(allSnapshots);
  if (sortedSnapshots.length === 0) {
    return { items: [], currentSnapshot: null, previousSnapshot: null };
  }

  // Filter snapshots up to target date first
  const snapshotsUpToDate = getSnapshotsUpToDate(sortedSnapshots, targetDateStr);
  const resolutionSnapshots = getSnapshotsByResolution(snapshotsUpToDate, resolution);
  
  if (resolutionSnapshots.length === 0) {
    return { items: [], currentSnapshot: null, previousSnapshot: null };
  }

  // Find exact or closest snapshot on or before targetDateStr
  let currentIdx = resolutionSnapshots.findIndex((s) => s.date === targetDateStr);
  if (currentIdx === -1) {
    for (let i = resolutionSnapshots.length - 1; i >= 0; i--) {
      if (resolutionSnapshots[i].date <= targetDateStr) {
        currentIdx = i;
        break;
      }
    }
    if (currentIdx === -1) {
      currentIdx = resolutionSnapshots.length - 1;
    }
  }

  const currentSnapshot = resolutionSnapshots[currentIdx];
  const previousSnapshot = currentIdx > 0 ? resolutionSnapshots[currentIdx - 1] : null;

  const items: SectorComparisonItem[] = currentSnapshot.sectors.map((currentSector) => {
    const prevSector = previousSnapshot
      ? previousSnapshot.sectors.find((s) => s.sector === currentSector.sector)
      : null;

    const curVal = currentSector[metric] as number;
    const prevVal = prevSector ? (prevSector[metric] as number) : null;

    let changeValue = 0;
    let changePercent = 0;

    if (prevVal !== null && prevVal !== undefined) {
      changeValue = curVal - prevVal;
      changePercent = prevVal !== 0 ? ((curVal - prevVal) / Math.abs(prevVal)) * 100 : 0;
    }

    // Historical trend strictly up to the current snapshot point
    const history = resolutionSnapshots.slice(0, currentIdx + 1).map((snap) => {
      const sec = snap.sectors.find((s) => s.sector === currentSector.sector);
      return {
        date: snap.date,
        value: sec ? (sec[metric] as number) : 0,
      };
    });

    return {
      sector: currentSector.sector,
      currentValue: curVal,
      previousValue: prevVal,
      changeValue,
      changePercent,
      history,
      allMetrics: currentSector,
    };
  });

  return {
    items,
    currentSnapshot,
    previousSnapshot,
  };
}

/**
 * Aggregates market summary figures
 */
export function computeMarketOverview(snapshot: DailySnapshot | null) {
  if (!snapshot || snapshot.sectors.length === 0) {
    return {
      totalMarketCap: 0,
      totalCompanies: 0,
      averagePE: 0,
      averageROCE: 0,
      averageOPM: 0,
      averageSalesGrowth: 0,
      topGainerSector: null as SectorDataPoint | null,
      topDeclineSector: null as SectorDataPoint | null,
    };
  }

  const totalCap = snapshot.sectors.reduce((acc, s) => acc + s.totalMarketCap, 0);
  const totalComp = snapshot.sectors.reduce((acc, s) => acc + s.noOfCompanies, 0);
  
  // Market cap weighted metrics
  const weightedPE = totalCap > 0
    ? snapshot.sectors.reduce((acc, s) => acc + s.medianPE * s.totalMarketCap, 0) / totalCap
    : 0;

  const weightedROCE = totalCap > 0
    ? snapshot.sectors.reduce((acc, s) => acc + s.wtdAvgROCE * s.totalMarketCap, 0) / totalCap
    : 0;

  const weightedOPM = totalCap > 0
    ? snapshot.sectors.reduce((acc, s) => acc + s.wtdAvgOPM * s.totalMarketCap, 0) / totalCap
    : 0;

  const weightedSales = totalCap > 0
    ? snapshot.sectors.reduce((acc, s) => acc + s.wtdAvgSalesGrowth * s.totalMarketCap, 0) / totalCap
    : 0;

  const sortedBy1Y = [...snapshot.sectors].sort((a, b) => b.median1YReturn - a.median1YReturn);

  return {
    totalMarketCap: totalCap,
    totalCompanies: totalComp,
    averagePE: weightedPE,
    averageROCE: weightedROCE,
    averageOPM: weightedOPM,
    averageSalesGrowth: weightedSales,
    topGainerSector: sortedBy1Y[0] || null,
    topDeclineSector: sortedBy1Y[sortedBy1Y.length - 1] || null,
  };
}
