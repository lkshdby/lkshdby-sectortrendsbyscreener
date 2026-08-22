import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface SectorDataPoint {
  sector: string;
  noOfCompanies: number;
  totalMarketCap: number;
  medianMarketCap: number;
  medianPE: number;
  wtdAvgSalesGrowth: number;
  wtdAvgOPM: number;
  wtdAvgROCE: number;
  median1YReturn: number;
}

interface DailySnapshot {
  date: string;
  timestamp: number;
  sectors: SectorDataPoint[];
}

function parseCleanNumber(valStr: string | undefined): number {
  if (!valStr) return 0;
  const cleaned = valStr.replace(/,/g, '').replace(/%/g, '').replace(/₹/g, '').trim();
  if (cleaned === '' || cleaned === '-' || cleaned === '—') return 0;
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

async function scrapeScreenerMarket(): Promise<SectorDataPoint[]> {
  const targetUrl = 'https://www.screener.in/market/';
  console.log(`[SCRAPER] Fetching live data from ${targetUrl}...`);

  const response = await axios.get(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
      'Cache-Control': 'no-cache',
    },
    timeout: 20000,
  });

  const $ = cheerio.load(response.data);
  const sectors: SectorDataPoint[] = [];

  $('table tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length >= 9) {
      const sectorName = $(tds[1]).text().trim().replace(/\s+/g, ' ');
      if (!sectorName || sectorName.toLowerCase().includes('total') || sectorName.toLowerCase().includes('average')) {
        return;
      }

      const noOfCompanies = Math.round(parseCleanNumber($(tds[2]).text()));
      const totalMarketCap = Math.round(parseCleanNumber($(tds[3]).text()));
      const medianMarketCap = Math.round(parseCleanNumber($(tds[4]).text()));
      const medianPE = parseFloat(parseCleanNumber($(tds[5]).text()).toFixed(2));
      const wtdAvgSalesGrowth = parseFloat(parseCleanNumber($(tds[6]).text()).toFixed(2));
      const wtdAvgOPM = parseFloat(parseCleanNumber($(tds[7]).text()).toFixed(2));
      const wtdAvgROCE = parseFloat(parseCleanNumber($(tds[8]).text()).toFixed(2));
      const median1YReturn = parseFloat(parseCleanNumber($(tds[9]).text()).toFixed(2));

      sectors.push({
        sector: sectorName,
        noOfCompanies,
        totalMarketCap,
        medianMarketCap,
        medianPE,
        wtdAvgSalesGrowth,
        wtdAvgOPM,
        wtdAvgROCE,
        median1YReturn,
      });
    }
  });

  console.log(`[SCRAPER] Successfully parsed ${sectors.length} industries.`);
  return sectors;
}

function getTodayISTDate(): string {
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return istFormatter.format(now);
}

async function main() {
  const today = getTodayISTDate();
  console.log(`[SCRAPER] Current IST Date: ${today}`);

  const sectors = await scrapeScreenerMarket();
  if (sectors.length === 0) {
    console.error('[SCRAPER] Error: No sectors parsed. Aborting to avoid corrupting data.');
    process.exit(1);
  }

  const newSnapshot: DailySnapshot = {
    date: today,
    timestamp: Date.now(),
    sectors,
  };

  const filePaths = [
    path.join(process.cwd(), 'public', 'data', 'snapshots.json'),
    path.join(process.cwd(), 'data', 'screener_industry_data.json'),
  ];

  for (const filePath of filePaths) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let snapshots: DailySnapshot[] = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        snapshots = JSON.parse(raw);
        if (!Array.isArray(snapshots)) snapshots = [];
      } catch (err) {
        console.warn(`[SCRAPER] Failed to read ${filePath}, initializing new list`);
        snapshots = [];
      }
    }

    // Deduplicate by date
    const dateMap = new Map<string, DailySnapshot>();
    snapshots.forEach((snap) => {
      if (snap && snap.date) {
        dateMap.set(snap.date, snap);
      }
    });

    // Update today's entry
    dateMap.set(today, newSnapshot);

    const merged = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
    console.log(`[SCRAPER] Successfully updated ${filePath} (${merged.length} daily snapshots total).`);
  }

  console.log(`[SCRAPER] Done! Updated snapshot for ${today} with ${sectors.length} sectors.`);
}

main().catch((err) => {
  console.error('[SCRAPER] Fatal error:', err);
  process.exit(1);
});
