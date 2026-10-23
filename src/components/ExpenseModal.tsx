import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, CreditCard, AlignLeft, Check, Sparkles, Trash2 } from 'lucide-react';
import { Expense, PaymentMethod } from '../types/expense';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { CategoryIcon, PaymentMethodIcon } from './CategoryIcon';
import { getTodayDateString } from '../services/storage';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  initialExpense?: Expense | null;
  currencySymbol: string;
}

const QUICK_SUGGESTIONS = [
  { title: 'Coffee & Snacks', category: 'food', amount: 120 },
  { title: 'Lunch / Dinner', category: 'food', amount: 350 },
  { title: 'Groceries & Milk', category: 'groceries', amount: 450 },
  { title: 'Cab / Metro / Fuel', category: 'transport', amount: 150 },
  { title: 'Pharmacy & Meds', category: 'health', amount: 200 },
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialExpense,
  currencySymbol,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title);
      setAmount(initialExpense.amount.toString());
      setCategory(initialExpense.category);
      setDate(initialExpense.date);
      setPaymentMethod(initialExpense.paymentMethod);
      setNotes(initialExpense.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setCategory('food');
      setDate(getTodayDateString());
      setPaymentMethod('upi');
      setNotes('');
    }
    setError('');
  }, [initialExpense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a description or title');
      return;
    }

    onSave(
      {
        title: title.trim(),
        amount: numAmount,
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      },
      initialExpense ? initialExpense.id : undefined
    );
    onClose();
  };

  const handleQuickAdd = (presetAmount: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + presetAmount).toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialExpense ? 'Edit Expense' : 'Log New Expense'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly saved to your device database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Amount Spent
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="w-full pl-12 pr-4 py-3 text-3xl font-black rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none text-slate-900 dark:text-white transition"
              />
            </div>
            {/* Quick Increment Buttons */}
            <div className="flex gap-2 pt-1 flex-wrap">
              {[50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition"
                >
                  +{currencySymbol}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              What was it for?
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Lunch with team, Uber ride, Grocery store"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:outline-none text-sm text-slate-900 dark:text-white transition"
              />
            </div>

            {/* Smart Suggestions Chips */}
            {!initialExpense && (
              <div className="flex gap-1.5 pt-1 overflow-x-auto pb-1 no-scrollbar text-xs">
                {QUICK_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTitle(item.title);
                      setCategory(item.category);
                      if (!amount) setAmount(item.amount.toString());
                    }}
                    className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Picker */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Category
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition text-left ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-white/20 text-white' : cat.bgLight + ' ' + cat.textColor
                      }`}
                    >
                      <CategoryIcon categoryId={cat.id} className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5" />
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Split with Alex, tax deductible, receipt #42"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            {initialExpense && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialExpense.id);
                  onClose();
                }}
                className="py-3 px-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 hover:text-rose-700 transition flex items-center justify-center active:scale-95"
                title="Delete this expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{initialExpense ? 'Update Expense' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
