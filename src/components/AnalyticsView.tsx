import React from 'react';
import { Expense } from '../types/expense';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { CategoryIcon, PaymentMethodIcon } from './CategoryIcon';
import { PieChart, TrendingUp, Calendar, Zap, Award, BarChart3 } from 'lucide-react';

interface AnalyticsViewProps {
  expenses: Expense[];
  currentMonth: string; // YYYY-MM
  currencySymbol: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenses,
  currentMonth,
  currencySymbol,
}) => {
  // Filter for the selected month
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (monthlyExpenses.length === 0) {
    return (
      <div className="p-10 sm:p-14 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <BarChart3 className="w-7 h-7" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            No Analytics for {currentMonth}
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Once you log daily expenses, visual graphs, category breakdowns, daily timeline bars, and spending habits will appear here automatically.
          </p>
        </div>
      </div>
    );
  }

  // Group by category
  const categoryMap: Record<string, { total: number; count: number }> = {};
  monthlyExpenses.forEach((e) => {
    if (!categoryMap[e.category]) {
      categoryMap[e.category] = { total: 0, count: 0 };
    }
    categoryMap[e.category].total += e.amount;
    categoryMap[e.category].count += 1;
  });

  const categoryStats = Object.keys(categoryMap)
    .map((catId) => {
      const catInfo = CATEGORIES.find((c) => c.id === catId);
      const total = categoryMap[catId].total;
      const percentage = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
      return {
        id: catId,
        name: catInfo ? catInfo.name : catId,
        color: catInfo ? catInfo.color : '#64748b',
        textColor: catInfo ? catInfo.textColor : '',
        bgLight: catInfo ? catInfo.bgLight : '',
        total,
        count: categoryMap[catId].count,
        percentage,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Group by day of the month
  const dayMap: Record<number, number> = {};
  monthlyExpenses.forEach((e) => {
    const day = parseInt(e.date.split('-')[2], 10);
    dayMap[day] = (dayMap[day] || 0) + e.amount;
  });

  const [yearStr, monthStr] = currentMonth.split('-');
  const daysInMonth = new Date(parseInt(yearStr), parseInt(monthStr), 0).getDate();
  const maxDaySpend = Math.max(...Object.values(dayMap), 1);

  // Group by payment method
  const paymentMap: Record<string, number> = {};
  monthlyExpenses.forEach((e) => {
    paymentMap[e.paymentMethod] = (paymentMap[e.paymentMethod] || 0) + e.amount;
  });

  // Insights
  const sortedExpenses = [...monthlyExpenses].sort((a, b) => b.amount - a.amount);
  const highestExpense = sortedExpenses[0];

  // Daily average
  const currentDay = new Date().getDate();
  const daysToCount = Math.min(daysInMonth, currentDay > 0 ? currentDay : 1);
  const dailyAverage = totalSpent / (daysToCount || 1);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Daily Average</span>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            {currencySymbol}{dailyAverage.toFixed(0)}
            <span className="text-xs font-normal text-slate-400"> / day</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <Award className="w-4 h-4 text-purple-500" />
            <span>Highest Single Expense</span>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            {highestExpense ? `${currencySymbol}${highestExpense.amount.toFixed(0)}` : '—'}
          </div>
          {highestExpense && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{highestExpense.title}</p>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Total Transactions</span>
          </div>
          <div className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            {monthlyExpenses.length}
            <span className="text-xs font-normal text-slate-400"> entries logged</span>
          </div>
        </div>
      </div>

      {/* Daily Spending Trend Bars */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Daily Spending Timeline
            </h3>
            <p className="text-xs text-slate-400">Day-by-day distribution for {currentMonth}</p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Peak: {currencySymbol}{maxDaySpend.toFixed(0)}
          </span>
        </div>

        {/* Bar chart grid */}
        <div className="h-32 flex items-end gap-1 pt-6 pb-2 overflow-x-auto no-scrollbar">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const spent = dayMap[day] || 0;
            const heightPercent = spent > 0 ? Math.max((spent / maxDaySpend) * 100, 10) : 4;
            const isToday = day === new Date().getDate() && currentMonth === new Date().toISOString().slice(0, 7);

            return (
              <div key={day} className="flex-1 min-w-[14px] flex flex-col items-center group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap shadow-md">
                    Day {day}: {currencySymbol}{spent.toFixed(0)}
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-1" />
                </div>

                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    spent > 0
                      ? isToday
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-sm'
                        : 'bg-emerald-500/80 hover:bg-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                />
                <span className={`text-[9px] mt-1 font-mono ${isToday ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                  {day % 5 === 0 || day === 1 ? day : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <PieChart className="w-4 h-4 text-emerald-600" />
          Spending by Category
        </h3>

        <div className="space-y-3.5">
          {categoryStats.map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${cat.bgLight} ${cat.textColor}`}
                  >
                    <CategoryIcon categoryId={cat.id} className="w-3 h-3" />
                  </div>
                  <span>{cat.name}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    ({cat.count} {cat.count === 1 ? 'item' : 'items'})
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {currencySymbol}{cat.total.toLocaleString()}
                  </span>
                  <span className="ml-1.5 text-[11px] font-semibold text-slate-400">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber-500" />
          Payment Methods Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {PAYMENT_METHODS.map((pm) => {
            const amount = paymentMap[pm.id] || 0;
            const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
            return (
              <div
                key={pm.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80"
              >
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <PaymentMethodIcon method={pm.id} className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">{pm.label.split('/')[0]}</span>
                </div>
                <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                  {currencySymbol}{amount.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {pct.toFixed(0)}% of total
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
