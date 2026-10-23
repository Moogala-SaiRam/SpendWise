import React, { useState } from 'react';
import { Expense } from '../types/expense';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { CategoryIcon, PaymentMethodIcon } from './CategoryIcon';
import { getTodayDateString } from '../services/storage';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Plus,
  ArrowUpDown,
  ShoppingBag,
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  currentMonth: string;
  currencySymbol: string;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenAddModal: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  currentMonth,
  currencySymbol,
  onEditExpense,
  onDeleteExpense,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const todayStr = getTodayDateString();

  // Filter expenses by selected month
  let filtered = expenses.filter((e) => e.date.startsWith(currentMonth));

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        (e.notes && e.notes.toLowerCase().includes(query)) ||
        e.category.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (selectedCategory !== 'all') {
    filtered = filtered.filter((e) => e.category === selectedCategory);
  }

  // Payment method filter
  if (selectedPayment !== 'all') {
    filtered = filtered.filter((e) => e.paymentMethod === selectedPayment);
  }

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'date_desc') return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
    if (sortBy === 'date_asc') return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
    if (sortBy === 'amount_desc') return b.amount - a.amount;
    if (sortBy === 'amount_asc') return a.amount - b.amount;
    return 0;
  });

  // Group by Date for beautiful daily timeline
  const groupedByDate: Record<string, { items: Expense[]; total: number }> = {};
  filtered.forEach((e) => {
    if (!groupedByDate[e.date]) {
      groupedByDate[e.date] = { items: [], total: 0 };
    }
    groupedByDate[e.date].items.push(e);
    groupedByDate[e.date].total += e.amount;
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    return sortBy === 'date_asc' ? a.localeCompare(b) : b.localeCompare(a);
  });

  const formatDateHeader = (dateStr: string) => {
    if (dateStr === todayStr) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = yesterday.toISOString().slice(0, 10);
    if (dateStr === yestStr) return 'Yesterday';

    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses (e.g. coffee, dinner, uber)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 pl-2.5 pr-7 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 appearance-none font-medium cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Category Filter Pills Horizontal Scroll */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full font-medium transition flex-shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Categories ({filtered.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition flex-shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CategoryIcon categoryId={cat.id} className="w-3 h-3" />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Timeline List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {expenses.length === 0 ? 'No expenses logged yet' : 'No matching transactions'}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {expenses.length === 0
                ? 'Your expense log is clean and ready. Tap below to log your first transaction.'
                : 'Try adjusting your search query or category filter.'}
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Log First Expense</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateStr) => {
            const group = groupedByDate[dateStr];
            const isToday = dateStr === todayStr;

            return (
              <div
                key={dateStr}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Date Group Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatDateHeader(dateStr)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">({dateStr})</span>
                    {isToday && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                    <span className="text-[10px] text-slate-400 font-normal mr-1">Daily Total:</span>
                    {currencySymbol}{group.total.toLocaleString()}
                  </div>
                </div>

                {/* Items in this Day */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {group.items.map((item) => {
                    const catInfo = CATEGORIES.find((c) => c.id === item.category);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition group"
                      >
                        {/* Left: Icon & Details */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              catInfo ? catInfo.bgLight + ' ' + catInfo.textColor : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <CategoryIcon categoryId={item.category} className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                {catInfo ? catInfo.name : item.category}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 uppercase text-[10px]">
                                <PaymentMethodIcon method={item.paymentMethod} className="w-3 h-3 text-slate-400" />
                                {item.paymentMethod}
                              </span>
                              {item.notes && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[120px] text-slate-400 italic">
                                    {item.notes}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & Action Buttons */}
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {currencySymbol}{item.amount.toLocaleString()}
                          </span>

                          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                            <button
                              onClick={() => onEditExpense(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpenseToDelete(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-90"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal (In-App Dialog, avoiding window.confirm) */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Expense</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Are you sure you want to delete this?</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
              <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
                {expenseToDelete.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {currencySymbol}{expenseToDelete.amount.toLocaleString()}
                </span>
                <span>•</span>
                <span>{expenseToDelete.date}</span>
                <span>•</span>
                <span className="capitalize">{expenseToDelete.category}</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteExpense(expenseToDelete.id);
                  setExpenseToDelete(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
