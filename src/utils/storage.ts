import { DailySnapshot } from '../types';

const LOCAL_STORAGE_KEY = 'screener_industry_snapshots_v1';

export function loadSnapshotsLocally(): DailySnapshot[] | null {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load snapshots from localStorage:', e);
  }
  return null;
}

export function saveSnapshotsLocally(snapshots: DailySnapshot[]): void {
  if (!snapshots || snapshots.length === 0) return;

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snapshots));
  } catch (err: any) {
    // Check if error is QuotaExceededError
    console.warn('localStorage full or quota exceeded, attempting compressed/trimmed cache:', err);
    try {
      // Keep only recent 30 days as a quick cache fallback to stay well within quota (< 300KB)
      const trimmed = snapshots.slice(-30);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // If even 30 days fails, clear the old key to prevent lingering stale data
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }
}
