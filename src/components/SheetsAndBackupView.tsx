import React, { useState, useRef } from 'react';
import { Expense, UserSettings, BudgetConfig } from '../types/expense';
import {
  downloadCSVFile,
  downloadJSONBackup,
  generateGoogleSheetsClipboardText,
  getTodayDateString,
} from '../services/storage';
import {
  FileSpreadsheet,
  Copy,
  Download,
  Upload,
  Check,
  ShieldCheck,
  Database,
  HelpCircle,
  Sparkles,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface SheetsAndBackupViewProps {
  expenses: Expense[];
  settings: UserSettings;
  budgets: Record<string, BudgetConfig>;
  currencySymbol: string;
  onRestoreExpenses: (newExpenses: Expense[]) => void;
  onClearAll: () => void;
}

export const SheetsAndBackupView: React.FC<SheetsAndBackupViewProps> = ({
  expenses,
  settings,
  budgets,
  currencySymbol,
  onRestoreExpenses,
  onClearAll,
}) => {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyForGoogleSheets = async () => {
    try {
      const text = generateGoogleSheetsClipboardText(expenses, currencySymbol);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownloadCSV = () => {
    downloadCSVFile(expenses, currencySymbol, `spendwise-expenses-${getTodayDateString()}.csv`);
  };

  const handleDownloadBackup = () => {
    downloadJSONBackup(expenses, settings, budgets);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.expenses)) {
          onRestoreExpenses(parsed.expenses);
          setImportStatus(`Successfully restored ${parsed.expenses.length} expenses!`);
        } else if (Array.isArray(parsed)) {
          onRestoreExpenses(parsed);
          setImportStatus(`Successfully restored ${parsed.length} expenses!`);
        } else {
          setImportStatus('Invalid backup file format');
        }
      } catch {
        setImportStatus('Failed to parse JSON file');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Educational Banner answering the user's core question */}
      <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-slate-800 dark:text-slate-200">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
              How Your Database Works — 100% Free Forever
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-extrabold uppercase">
                Zero Cloud Bills
              </span>
            </h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              Instead of paying for expensive cloud servers or databases that shut down after temporary credits expire,
              <strong> SpendWise stores all your daily and monthly expenses directly in your phone&apos;s built-in local database (IndexedDB / LocalStorage)</strong>.
              It works <strong>100% offline</strong> with <strong>0ms instant speed</strong> and complete privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Google Sheets Integration Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Google Sheets & Excel Integration
              </h3>
              <p className="text-xs text-slate-400">
                Sync and export your transactions to Google Sheets with zero API setup
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            How to use with Google Sheets:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-500 dark:text-slate-400 text-xs">
            <li>
              Click <strong className="text-slate-700 dark:text-slate-200">&quot;Copy for Google Sheets&quot;</strong> below.
            </li>
            <li>
              Open a new spreadsheet on <strong className="text-emerald-600">sheets.google.com</strong>.
            </li>
            <li>
              Click cell <strong>A1</strong> and press <strong>Paste (Ctrl+V / Cmd+V)</strong>. All columns (Date, Title, Category, Amount, Payment Method, Notes) paste cleanly into separate spreadsheet columns!
            </li>
            <li>
              Alternatively, download the formatted <strong>.CSV file</strong> and upload it directly to Google Drive or Sheets.
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleCopyForGoogleSheets}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm active:scale-98"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy for Google Sheets (1-Click)'}</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition active:scale-98"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download .CSV Spreadsheet</span>
          </button>
        </div>

        {/* Live Preview Table */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Spreadsheet Preview ({expenses.length} records)</span>
            <span className="text-[10px] text-slate-400">
              {expenses.length > 0 ? 'Ready to export' : 'Empty database'}
            </span>
          </div>
          <div className="overflow-x-auto max-h-48 border border-slate-200 dark:border-slate-800 rounded-2xl">
            {expenses.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No transactions logged yet. Your Google Sheets formatted table preview will appear here.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                    <th className="py-2 px-3">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                  {expenses.slice(0, 5).map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-mono text-[11px]">{e.date}</td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">{e.title}</td>
                      <td className="py-2 px-3 capitalize">{e.category}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {currencySymbol}{e.amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 uppercase text-[10px]">{e.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Complete Backup & Restore (JSON) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Full Phone Data Backup & Restore
            </h3>
            <p className="text-xs text-slate-400">
              Download your complete database file to switch phones or save a snapshot
            </p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadBackup}
            disabled={expenses.length === 0}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-xs transition ${
              expenses.length === 0
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Complete Backup (.json)</span>
          </button>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition"
            >
              <Upload className="w-4 h-4 text-blue-500" />
              <span>Restore from Backup File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Database Reset Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Data Management
        </h4>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={expenses.length === 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition ${
              expenses.length === 0
                ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                : 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border-rose-200 dark:border-rose-900/50 active:scale-95'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Clear All Expenses?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">All {expenses.length} records will be deleted</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will erase all expenses saved on this device. You can download a backup first if you want to keep your data.
            </p>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition shadow-sm"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
