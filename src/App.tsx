/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  loadExpenses,
  saveExpenses,
  loadSettings,
  saveSettings,
  loadBudgets,
  saveBudgets,
  getCurrentMonthString,
  getTodayDateString,
} from './services/storage';
import { Expense, BudgetConfig, UserSettings } from './types/expense';
import { ExpenseList } from './components/ExpenseList';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetPlanner } from './components/BudgetPlanner';
import { SheetsAndBackupView } from './components/SheetsAndBackupView';
import { ExpenseModal } from './components/ExpenseModal';
import { Sidebar } from './components/Sidebar';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  TrendingDown,
  Calendar,
  PiggyBank,
  Plus,
  PieChart,
  Target,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<UserSettings>(loadSettings);
  const [budgets, setBudgets] = useState<Record<string, BudgetConfig>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [activeTab, setActiveTab] = useState<'expenses' | 'analytics' | 'budgets' | 'sheets'>('expenses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Load from local-first storage on initial mount
  useEffect(() => {
    const loadedExp = loadExpenses();
    setExpenses(loadedExp);
    const loadedBud = loadBudgets();
    setBudgets(loadedBud);
  }, []);

  // Update storage whenever expenses change
  const handleUpdateExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    saveExpenses(newExpenses);
  };

  const handleSaveExpense = (
    data: Omit<Expense, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      // Edit
      const updated = expenses.map((e) =>
        e.id === existingId ? { ...e, ...data } : e
      );
      handleUpdateExpenses(updated);
    } else {
      // New
      const newEntry: Expense = {
        ...data,
        id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: Date.now(),
      };
      handleUpdateExpenses([newEntry, ...expenses]);
    }
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    handleUpdateExpenses(updated);
  };

  const handleSaveBudget = (month: string, config: BudgetConfig) => {
    const updated = { ...budgets, [month]: config };
    setBudgets(updated);
    saveBudgets(updated);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    const updated = { ...settings, currency: newCurrency };
    setSettings(updated);
    saveSettings(updated);
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  const formatMonthTitle = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Metrics calculation
  const todayStr = getTodayDateString();
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const todayExpenses = expenses.filter((e) => e.date === todayStr);

  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSpentToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const monthBudgetConfig = budgets[selectedMonth] || {
    month: selectedMonth,
    totalBudget: settings.monthlyBudget || 0,
    categoryBudgets: {},
  };
  const totalBudget = monthBudgetConfig.totalBudget;
  const remainingBudget = totalBudget - totalSpentThisMonth;
  const budgetUtilization = totalBudget > 0 ? (totalSpentThisMonth / totalBudget) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <OfflineIndicator />

      {/* Side Panel (Desktop Sticky Sidebar + Mobile Slide-In Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenAddModal={() => {
          setEditingExpense(null);
          setIsModalOpen(true);
        }}
        expensesCount={currentMonthExpenses.length}
        currencySymbol={settings.currency}
        totalBudget={totalBudget}
        totalSpentThisMonth={totalSpentThisMonth}
        selectedMonth={formatMonthTitle(selectedMonth)}
        settings={settings}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-10">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Left: Mobile Menu Hamburger & Active Page Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Open Side Panel Menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {activeTab === 'expenses' && 'Daily Expenses'}
                  {activeTab === 'analytics' && 'Analytics & Spending Trends'}
                  {activeTab === 'budgets' && 'Monthly Budget Planner'}
                  {activeTab === 'sheets' && 'Google Sheets & Backup'}
                </h2>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  {formatMonthTitle(selectedMonth)} • {currentMonthExpenses.length} transactions
                </p>
              </div>
            </div>

            {/* Right: Quick Today summary and Quick Log button */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Today:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {settings.currency}{totalSpentToday.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  setEditingExpense(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Log Expense</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-5 pb-8 space-y-6 flex-1">
          {/* Month Selector Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {formatMonthTitle(selectedMonth)}
              </span>
              {selectedMonth !== getCurrentMonthString() && (
                <button
                  onClick={() => setSelectedMonth(getCurrentMonthString())}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg ml-1 hover:underline"
                >
                  Go to Current
                </button>
              )}
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Top KPI Cards (Daily & Monthly Summary) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Total Spent This Month */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-emerald-100 text-xs font-semibold uppercase tracking-wider">
                  <span>Month Total</span>
                  <TrendingDown className="w-4 h-4 text-emerald-200" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
                  {settings.currency}{totalSpentThisMonth.toLocaleString()}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-emerald-100 font-medium">
                {currentMonthExpenses.length} transactions in {formatMonthTitle(selectedMonth).split(' ')[0]}
              </div>
            </div>

            {/* Today's Expense (Daily Tracking) */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Today&apos;s Spending</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {settings.currency}{totalSpentToday.toLocaleString()}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>{todayExpenses.length} logged today</span>
                <button
                  onClick={() => {
                    setEditingExpense(null);
                    setIsModalOpen(true);
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  + Log Today
                </button>
              </div>
            </div>

            {/* Budget Remaining */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Monthly Budget</span>
                  <PiggyBank className="w-4 h-4 text-teal-500" />
                </div>
                <div
                  className={`mt-2 text-2xl sm:text-3xl font-black ${
                    totalBudget > 0
                      ? remainingBudget >= 0
                        ? 'text-slate-900 dark:text-white'
                        : 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {totalBudget > 0 ? (
                    <>
                      {remainingBudget < 0 && '-'}{settings.currency}{Math.abs(remainingBudget).toLocaleString()}
                    </>
                  ) : (
                    <span className="text-xl font-bold text-slate-400">Not Set</span>
                  )}
                </div>
              </div>
              <div className="mt-3">
                {totalBudget > 0 ? (
                  <>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>{budgetUtilization.toFixed(0)}% used</span>
                      <span>Limit: {settings.currency}{totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          budgetUtilization > 100
                            ? 'bg-rose-500'
                            : budgetUtilization > 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setActiveTab('budgets')}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Configure Monthly Target</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active View Content (Seamlessly Switched via Side Panel Navigation) */}
          {activeTab === 'expenses' && (
            <ExpenseList
              expenses={expenses}
              currentMonth={selectedMonth}
              currencySymbol={settings.currency}
              onEditExpense={(item) => {
                setEditingExpense(item);
                setIsModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onOpenAddModal={() => {
                setEditingExpense(null);
                setIsModalOpen(true);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              expenses={expenses}
              currentMonth={selectedMonth}
              currencySymbol={settings.currency}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetPlanner
              currentMonth={selectedMonth}
              currencySymbol={settings.currency}
              expenses={expenses}
              budgets={budgets}
              onSaveBudget={handleSaveBudget}
            />
          )}

          {activeTab === 'sheets' && (
            <SheetsAndBackupView
              expenses={expenses}
              settings={settings}
              budgets={budgets}
              currencySymbol={settings.currency}
              onRestoreExpenses={handleUpdateExpenses}
              onClearAll={() => handleUpdateExpenses([])}
            />
          )}
        </main>

        {/* Floating Action Button (Mobile Thumb Reach) */}
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
          className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30 active:scale-90 transition"
          title="Add Expense"
        >
          <Plus className="w-7 h-7" />
        </button>

        {/* Mobile Bottom Navigation Bar (Ultra Easy On Phone Displays) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === 'expenses'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Expenses</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === 'analytics'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <PieChart className="w-5 h-5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === 'budgets'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-5 h-5" />
            <span>Budgets</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              activeTab === 'sheets'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Sheets</span>
          </button>
        </nav>
      </div>

      {/* Expense Modal (Add / Edit) */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        onDelete={handleDeleteExpense}
        initialExpense={editingExpense}
        currencySymbol={settings.currency}
      />
    </div>
  );
}
