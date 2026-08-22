import React, { useState } from 'react';
import {
  Check,
  ClipboardCopy,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { DailySnapshot } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: DailySnapshot[];
  onImportData: (importedSnapshots: DailySnapshot[]) => void;
  onResetSeedData: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  onImportData,
  onResetSeedData,
}) => {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate CSV Data String
  const generateCSV = (): string => {
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

    return rows.join('\n');
  };

  // Direct CSV File Download
  const handleDownloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `screener_industry_trends_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct JSON File Download
  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(snapshots, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `screener_industry_trends_backup_${today}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy CSV to Clipboard for Excel / Google Sheets
  const handleCopyClipboard = () => {
    const csvContent = generateCSV();
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // File Import Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].date && parsed[0].sectors) {
          onImportData(parsed);
          setImportStatus(`Successfully restored ${parsed.length} days of snapshots!`);
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus('Error: Invalid dataset structure. Must be an array of snapshots.');
        }
      } catch (err: any) {
        setImportStatus(`Error parsing JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full flex flex-col border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 text-white">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Export & Backup Dataset</h3>
              <p className="text-xs text-zinc-500">
                Prevent any data loss with universal CSV and JSON backups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-200/80 hover:bg-zinc-300 flex items-center justify-center text-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Summary Box */}
          <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-zinc-500">Stored Historical Records:</span>
              <div className="font-bold text-zinc-900 text-sm">
                {snapshots.length} Trading Days ({snapshots.reduce((a, b) => a + b.sectors.length, 0)}{' '}
                Sector Rows)
              </div>
            </div>
            <div className="text-right">
              <span className="text-zinc-500">Date Range:</span>
              <div className="font-semibold text-zinc-800">
                {snapshots[0]?.date} → {snapshots[snapshots.length - 1]?.date}
              </div>
            </div>
          </div>

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Download CSV */}
            <button
              onClick={handleDownloadCSV}
              className="p-4 rounded-xl border border-zinc-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all flex flex-col items-start text-left group bg-white shadow-2xs"
            >
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 mb-3 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-zinc-900 group-hover:text-emerald-800">
                Export to CSV (.csv)
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Formatted for Excel, Google Sheets, Python, and BI dashboards.
              </div>
            </button>

            {/* Download JSON */}
            <button
              onClick={handleDownloadJSON}
              className="p-4 rounded-xl border border-zinc-200 hover:border-indigo-600 hover:bg-indigo-50/40 transition-all flex flex-col items-start text-left group bg-white shadow-2xs"
            >
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800 mb-3 group-hover:scale-105 transition-transform">
                <FileJson className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-zinc-900 group-hover:text-indigo-800">
                Export Raw JSON (.json)
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Full structured schema backup for restoring into this app anytime.
              </div>
            </button>
          </div>

          {/* Quick Copy to Clipboard */}
          <button
            onClick={handleCopyClipboard}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs rounded-xl border border-zinc-300 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <ClipboardCopy className="w-4 h-4" />}
            <span>{copied ? 'Copied CSV Data to Clipboard!' : 'Copy Table CSV to Clipboard'}</span>
          </button>

          {/* Import / Restore Section */}
          <div className="border-t border-zinc-200 pt-4">
            <span className="text-xs font-bold text-zinc-700 block mb-2">
              Restore / Import Backup:
            </span>
            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:bg-zinc-50 hover:border-zinc-400 transition-colors text-xs font-semibold text-zinc-700">
              <Upload className="w-4 h-4 text-zinc-500" />
              <span>Select previously exported .JSON backup file</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {importStatus && (
              <div className="mt-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-center">
                {importStatus}
              </div>
            )}
          </div>

          {/* Reset Baseline Seed Data */}
          <div className="border-t border-zinc-200 pt-3 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Need to reload standard 1-year dataset?</span>
            <button
              onClick={() => {
                if (confirm('Reload the full 1-year historical Screener dataset?')) {
                  onResetSeedData();
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 font-semibold underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset 1-Year Baseline</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
