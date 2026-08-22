import axios from 'axios';
import * as cheerio from 'cheerio';
import { SectorDataPoint } from '../src/types';

export interface ScrapedScreenerMarketResult {
  url: string;
  fetchedAt: string;
  industryCount: number;
  sectors: SectorDataPoint[];
}

function parseCleanNumber(valStr: string | undefined): number {
  if (!valStr) return 0;
  // Clean whitespace, commas, percentage signs, rupee symbols, quotes
  const cleaned = valStr.replace(/,/g, '').replace(/%/g, '').replace(/₹/g, '').trim();
  if (cleaned === '' || cleaned === '-' || cleaned === '—') return 0;
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export async function scrapeScreenerMarket(): Promise<ScrapedScreenerMarketResult> {
  const targetUrl = 'https://www.screener.in/market/';
  
  const response = await axios.get(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
      'Cache-Control': 'no-cache',
    },
    timeout: 15000,
  });

  const $ = cheerio.load(response.data);
  const sectors: SectorDataPoint[] = [];

  // Table rows in screener.in/market/
  $('table tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length >= 9) {
      // Screener.in /market/ columns:
      // td[0]: S.No. (e.g. "1.")
      // td[1]: Industry (e.g. "2/3 Wheelers", "Abrasives & Bearings", "Zinc")
      // td[2]: No. of Companies
      // td[3]: Total Market Cap. (in Cr.)
      // td[4]: Median Market Cap. (in Cr.)
      // td[5]: Median P/E
      // td[6]: Wtd. Avg Sales Growth (%)
      // td[7]: Wtd. Avg OPM (%)
      // td[8]: Wtd. Avg ROCE (%)
      // td[9]: Median 1Y Return (%)
      
      const sectorName = $(tds[1]).text().trim().replace(/\s+/g, ' ');
      if (!sectorName || sectorName.toLowerCase().includes('total') || sectorName.toLowerCase().includes('average')) {
        return;
      }

      const noOfCompanies = Math.round(parseCleanNumber($(tds[2]).text()));
      const totalMarketCap = parseCleanNumber($(tds[3]).text());
      const medianMarketCap = parseCleanNumber($(tds[4]).text());
      const medianPE = parseCleanNumber($(tds[5]).text());
      const wtdAvgSalesGrowth = parseCleanNumber($(tds[6]).text());
      const wtdAvgOPM = parseCleanNumber($(tds[7]).text());
      const wtdAvgROCE = parseCleanNumber($(tds[8]).text());
      const median1YReturn = tds.length > 9 ? parseCleanNumber($(tds[9]).text()) : 0;

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

  if (sectors.length === 0) {
    throw new Error('No industry rows found in Screener.in table. The HTML structure might have changed.');
  }

  return {
    url: targetUrl,
    fetchedAt: new Date().toISOString(),
    industryCount: sectors.length,
    sectors,
  };
}
