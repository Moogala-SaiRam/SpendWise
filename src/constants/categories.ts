import { CategoryInfo, CurrencyConfig } from '../types/expense';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#f97316', // orange
    textColor: 'text-orange-600 dark:text-orange-400',
    bgLight: 'bg-orange-500/10 dark:bg-orange-500/20',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: '#10b981', // emerald
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-500/10 dark:bg-emerald-500/20',
  },
  {
    id: 'transport',
    name: 'Transport & Fuel',
    icon: 'Car',
    color: '#3b82f6', // blue
    textColor: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-500/10 dark:bg-blue-500/20',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#ec4899', // pink
    textColor: 'text-pink-600 dark:text-pink-400',
    bgLight: 'bg-pink-500/10 dark:bg-pink-500/20',
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#eab308', // yellow
    textColor: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-500/10 dark:bg-amber-500/20',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#8b5cf6', // purple
    textColor: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-500/10 dark:bg-purple-500/20',
  },
  {
    id: 'health',
    name: 'Health & Medical',
    icon: 'HeartPulse',
    color: '#ef4444', // red
    textColor: 'text-red-600 dark:text-red-400',
    bgLight: 'bg-red-500/10 dark:bg-red-500/20',
  },
  {
    id: 'education',
    name: 'Education & Work',
    icon: 'GraduationCap',
    color: '#06b6d4', // cyan
    textColor: 'text-cyan-600 dark:text-cyan-400',
    bgLight: 'bg-cyan-500/10 dark:bg-cyan-500/20',
  },
  {
    id: 'personal',
    name: 'Personal Care',
    icon: 'Sparkles',
    color: '#14b8a6', // teal
    textColor: 'text-teal-600 dark:text-teal-400',
    bgLight: 'bg-teal-500/10 dark:bg-teal-500/20',
  },
  {
    id: 'other',
    name: 'Other Expenses',
    icon: 'MoreHorizontal',
    color: '#64748b', // slate
    textColor: 'text-slate-600 dark:text-slate-400',
    bgLight: 'bg-slate-500/10 dark:bg-slate-500/20',
  },
];

export const PAYMENT_METHODS: { id: string; label: string; icon: string }[] = [
  { id: 'upi', label: 'UPI / GPay / PhonePe', icon: 'Smartphone' },
  { id: 'card', label: 'Credit / Debit Card', icon: 'CreditCard' },
  { id: 'cash', label: 'Cash', icon: 'Banknote' },
  { id: 'bank_transfer', label: 'Net Banking', icon: 'Building' },
  { id: 'other', label: 'Other', icon: 'Wallet' },
];

export const CURRENCIES: CurrencyConfig[] = [
  { symbol: '₹', code: 'INR', label: 'Indian Rupee (₹)' },
  { symbol: '$', code: 'USD', label: 'US Dollar ($)' },
  { symbol: '€', code: 'EUR', label: 'Euro (€)' },
  { symbol: '£', code: 'GBP', label: 'British Pound (£)' },
  { symbol: 'AED', code: 'AED', label: 'UAE Dirham (AED)' },
  { symbol: 'C$', code: 'CAD', label: 'Canadian Dollar (C$)' },
  { symbol: 'A$', code: 'AUD', label: 'Australian Dollar (A$)' },
  { symbol: 'S$', code: 'SGD', label: 'Singapore Dollar (S$)' },
];
