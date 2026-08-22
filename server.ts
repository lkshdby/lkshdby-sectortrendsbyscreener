import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  generateHistoryFromLiveSectors,
  getAllSnapshots,
  getSchedulerInfo,
  initializeDataStore,
  performDaily7PMFetch,
  persistSnapshots,
  startBackgroundCron,
} from './server/fetcher';
import { scrapeScreenerMarket } from './server/screenerScraper';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing
  app.use(express.json({ limit: '50mb' }));

  // Initialize data store and background cron
  initializeDataStore();
  startBackgroundCron();

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all snapshots
  app.get('/api/data', (req, res) => {
    try {
      const data = getAllSnapshots();
      res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save / Sync snapshots
  app.post('/api/data', (req, res) => {
    try {
      const { snapshots } = req.body;
      if (!Array.isArray(snapshots)) {
        return res.status(400).json({ success: false, error: 'snapshots must be an array' });
      }
      persistSnapshots(snapshots);
      res.json({ success: true, count: snapshots.length, message: 'Dataset updated successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Trigger manual on-demand fetch from https://www.screener.in/market/
  app.post('/api/fetch-now', async (req, res) => {
    try {
      const { targetDate, force } = req.body || {};
      const result = await performDaily7PMFetch(targetDate, force !== undefined ? force : true);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reset & Re-fetch 188 sectors directly from Screener.in /market/
  app.post('/api/reset-seed', async (req, res) => {
    try {
      const scraped = await scrapeScreenerMarket();
      const today = new Date().toISOString().split('T')[0];
      const history = generateHistoryFromLiveSectors(scraped.sectors, '2025-08-20', today);
      
      const todaySnapshot = {
        date: today,
        timestamp: new Date(`${today}T19:00:00+05:30`).getTime(),
        sectors: scraped.sectors,
        fetchedAt: scraped.fetchedAt,
        source: scraped.url,
      };

      const existingIdx = history.findIndex((s) => s.date === today);
      if (existingIdx >= 0) {
        history[existingIdx] = todaySnapshot;
      } else {
        history.push(todaySnapshot);
      }

      persistSnapshots(history);
      res.json({
        success: true,
        count: history.length,
        industryCount: scraped.industryCount,
        message: `Successfully re-scraped https://www.screener.in/market/ with ${scraped.industryCount} industry sectors and generated historical series.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get scheduler status
  app.get('/api/scheduler-status', (req, res) => {
    try {
      const info = getSchedulerInfo();
      res.json({ success: true, info });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // CSV Export endpoint
  app.get('/api/export/csv', (req, res) => {
    try {
      const snapshots = getAllSnapshots();
      const headers = [
        'Date',
        'Sector',
        'No. of Companies',
        'Total Market Cap (Cr)',
        'Median Market Cap (Cr)',
        'Median P/E',
        'Wtd. Avg Sales Growth (%)',
        'Wtd. Avg OPM (%)',
        'Wtd. Avg ROCE (%)',
        'Median 1Y Return (%)',
      ];

      const rows: string[] = [headers.join(',')];

      snapshots.forEach((snap) => {
        snap.sectors.forEach((s) => {
          rows.push(
            [
              snap.date,
              `"${s.sector.replace(/"/g, '""')}"`,
              s.noOfCompanies,
              s.totalMarketCap,
              s.medianMarketCap,
              s.medianPE,
              s.wtdAvgSalesGrowth,
              s.wtdAvgOPM,
              s.wtdAvgROCE,
              s.median1YReturn,
            ].join(',')
          );
        });
      });

      const csvContent = rows.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="screener_industry_trends_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // JSON Export endpoint
  app.get('/api/export/json', (req, res) => {
    try {
      const snapshots = getAllSnapshots();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="screener_industry_trends_${new Date().toISOString().split('T')[0]}.json"`);
      res.send(JSON.stringify(snapshots, null, 2));
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`screener.in industry trends server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
