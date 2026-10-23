import React from 'react';
import {
  Wallet,
  Calendar,
  PieChart,
  Target,
  FileSpreadsheet,
  Plus,
  X,
  Globe,
  Database,
  TrendingDown,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { CURRENCIES } from '../constants/categories';
import { UserSettings } from '../types/expense';

interface SidebarProps {
  activeTab: 'expenses' | 'analytics' | 'budgets' | 'sheets';
  setActiveTab: (tab: 'expenses' | 'analytics' | 'budgets' | 'sheets') => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal: () => void;
  expensesCount: number;
  currencySymbol: string;
  totalBudget: number;
  totalSpentThisMonth: number;
  selectedMonth: string;
  settings: UserSettings;
  onCurrencyChange: (currency: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  onOpenAddModal,
  expensesCount,
  currencySymbol,
  totalBudget,
  totalSpentThisMonth,
  selectedMonth,
  settings,
  onCurrencyChange,
}) => {
  const budgetUtilization = totalBudget > 0 ? (totalSpentThisMonth / totalBudget) * 100 : 0;

  interface NavItem {
    id: 'expenses' | 'analytics' | 'budgets' | 'sheets';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'expenses',
      label: 'Daily Expenses',
      icon: Calendar,
      badge: expensesCount > 0 ? `${expensesCount}` : undefined,
    },
    {
      id: 'analytics',
      label: 'Analytics & Trends',
      icon: PieChart,
    },
    {
      id: 'budgets',
      label: 'Budget Planner',
      icon: Target,
      badge: totalBudget > 0 ? `${budgetUtilization.toFixed(0)}%` : undefined,
    },
    {
      id: 'sheets',
      label: 'Google Sheets & Backup',
      icon: FileSpreadsheet,
    },
  ];

  const handleNavClick = (tabId: 'expenses' | 'analytics' | 'budgets' | 'sheets') => {
    setActiveTab(tabId);
    onClose();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between overflow-y-auto">
      {/* Top Portion: Brand + Nav */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                SpendWise
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Expense Tracker</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Log Button */}
        <button
          onClick={() => {
            onOpenAddModal();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition"
        >
          <Plus className="w-5 h-5" />
          <span>Log New Expense</span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mini Month Budget Widget in Sidebar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
              {selectedMonth} Spending
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {currencySymbol}{totalSpentThisMonth.toLocaleString()}
            </span>
          </div>

          {totalBudget > 0 && (
            <>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
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
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{budgetUtilization.toFixed(0)}% used</span>
                <span>Limit: {currencySymbol}{totalBudget.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Portion: Currency & PWA Install */}
      <div className="pt-6 mt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
        {/* Currency Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Globe className="w-3 h-3 text-slate-400" />
            Active Currency
          </label>
          <div className="relative">
            <select
              value={settings.currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="w-full py-2 pl-3 pr-8 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.symbol}>
                  {curr.symbol} — {curr.label}
                </option>
              ))}
            </select>
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* PWA Install Button */}
        <div className="pt-1">
          <PWAInstallButton />
        </div>

        {/* Database notice */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
          <Database className="w-3 h-3 text-emerald-500" />
          <span>Local Device Storage (100% Private)</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed/Sticky Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Side Panel Slide-In) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
          />

          {/* Drawer Container */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-slate-900 p-5 shadow-2xl z-50 flex flex-col justify-between animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
