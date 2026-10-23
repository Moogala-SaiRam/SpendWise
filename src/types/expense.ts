export type PaymentMethod = 'upi' | 'card' | 'cash' | 'bank_transfer' | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  textColor: string;
  bgLight: string;
}

export interface BudgetConfig {
  month: string; // YYYY-MM
  totalBudget: number;
  categoryBudgets: Record<string, number>;
}

export interface CurrencyConfig {
  symbol: string;
  code: string;
  label: string;
}

export interface UserSettings {
  currency: string;
  monthlyBudget: number;
  userName: string;
  viewMode: 'all' | 'daily' | 'monthly';
}
