import { Expense, BudgetConfig, UserSettings } from '../types/expense';

const EXPENSES_STORAGE_KEY = 'spendwise_expenses_v2';
const SETTINGS_STORAGE_KEY = 'spendwise_settings_v1';
const BUDGETS_STORAGE_KEY = 'spendwise_budgets_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

const DEFAULT_SETTINGS: UserSettings = {
  currency: '₹',
  monthlyBudget: 0,
  userName: 'User',
  viewMode: 'all',
};

export function loadExpenses(): Expense[] {
  try {
    // Clear out old v1 dummy data if present
    localStorage.removeItem('spendwise_expenses_v1');

    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out any demo data items to ensure a 100% clean app
    return parsed.filter((item: Expense) => item && item.id && !item.id.startsWith('demo-'));
  } catch (err) {
    console.error('Failed to load expenses from localStorage:', err);
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    const cleanList = expenses.filter((item) => item && item.id && !item.id.startsWith('demo-'));
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(cleanList));
  } catch (err) {
    console.error('Failed to save expenses to localStorage:', err);
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadBudgets(): Record<string, BudgetConfig> {
  try {
    const raw = localStorage.getItem(BUDGETS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveBudgets(budgets: Record<string, BudgetConfig>): void {
  try {
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  } catch (err) {
    console.error('Failed to save budgets:', err);
  }
}

/**
 * Generates CSV string optimized for Google Sheets and Excel
 */
export function generateCSV(expenses: Expense[], currencySymbol: string): string {
  const headers = ['Date', 'Title', 'Category', `Amount (${currencySymbol})`, 'Payment Method', 'Notes', 'Created Timestamp'];
  const rows = expenses.map(e => [
    e.date,
    `"${(e.title || '').replace(/"/g, '""')}"`,
    `"${(e.category || '').replace(/"/g, '""')}"`,
    e.amount.toFixed(2),
    `"${(e.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
    new Date(e.createdAt).toISOString(),
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Generates TSV (Tab Separated Values) for instant copy-pasting directly into Google Sheets cells
 */
export function generateGoogleSheetsClipboardText(expenses: Expense[], currencySymbol: string): string {
  const headers = ['Date', 'Title', 'Category', `Amount (${currencySymbol})`, 'Payment Method', 'Notes'];
  const rows = expenses.map(e => [
    e.date,
    e.title,
    e.category,
    e.amount.toFixed(2),
    e.paymentMethod,
    e.notes || '',
  ]);

  return [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
}

/**
 * Downloads a CSV file to device storage
 */
export function downloadCSVFile(expenses: Expense[], currencySymbol: string, filename = 'spendwise-expenses.csv') {
  const csvContent = '\uFEFF' + generateCSV(expenses, currencySymbol); // UTF-8 BOM
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports full backup as JSON
 */
export function downloadJSONBackup(expenses: Expense[], settings: UserSettings, budgets: Record<string, BudgetConfig>) {
  const data = {
    app: 'SpendWise',
    version: '2.0',
    exportDate: new Date().toISOString(),
    settings,
    budgets,
    expenses,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `spendwise-backup-${getTodayDateString()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
