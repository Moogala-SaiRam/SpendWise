import React, { useState } from 'react';
import { BudgetConfig, Expense } from '../types/expense';
import { CATEGORIES } from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';
import { Target, AlertTriangle, CheckCircle2, ShieldCheck, Edit3, PlusCircle } from 'lucide-react';

interface BudgetPlannerProps {
  currentMonth: string;
  currencySymbol: string;
  expenses: Expense[];
  budgets: Record<string, BudgetConfig>;
  onSaveBudget: (month: string, config: BudgetConfig) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  currentMonth,
  currencySymbol,
  expenses,
  budgets,
  onSaveBudget,
}) => {
  const currentConfig: BudgetConfig = budgets[currentMonth] || {
    month: currentMonth,
    totalBudget: 0,
    categoryBudgets: {},
  };

  const hasBudgetSet = currentConfig.totalBudget > 0;
  const [isEditing, setIsEditing] = useState(!hasBudgetSet);
  const [totalLimit, setTotalLimit] = useState(
    currentConfig.totalBudget > 0 ? currentConfig.totalBudget.toString() : ''
  );
  const [catLimits, setCatLimits] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(currentConfig.categoryBudgets || {}).map(([k, v]) => [k, v.toString()])
    )
  );

  // Calculate actual spending this month
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const categorySpentMap: Record<string, number> = {};
  monthlyExpenses.forEach((e) => {
    categorySpentMap[e.category] = (categorySpentMap[e.category] || 0) + e.amount;
  });

  const handleSave = () => {
    const parsedTotal = parseFloat(totalLimit) || 0;
    const parsedCatBudgets: Record<string, number> = {};

    Object.entries(catLimits).forEach(([catId, val]) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        parsedCatBudgets[catId] = num;
      }
    });

    onSaveBudget(currentMonth, {
      month: currentMonth,
      totalBudget: parsedTotal,
      categoryBudgets: parsedCatBudgets,
    });
    setIsEditing(false);
  };

  const totalBudgetNum = currentConfig.totalBudget;
  const overallPercentage = totalBudgetNum > 0 ? (totalSpent / totalBudgetNum) * 100 : 0;
  const remainingBudget = totalBudgetNum - totalSpent;

  return (
    <div className="space-y-6">
      {/* Overall Budget Status Hero Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Spending Target</h3>
              <p className="text-xs text-slate-400">Budget for {currentMonth}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isEditing ? 'Cancel Edit' : hasBudgetSet ? 'Edit Limits' : 'Set Budget'}</span>
          </button>
        </div>

        {hasBudgetSet ? (
          <>
            {/* Current status display */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              <div>
                <div className="text-xs text-slate-400">Total Spent</div>
                <div className="text-2xl font-black text-white mt-1">
                  {currencySymbol}{totalSpent.toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Monthly Limit</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {currencySymbol}{totalBudgetNum.toLocaleString()}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-400">
                  {remainingBudget >= 0 ? 'Remaining to Spend' : 'Over Budget By'}
                </div>
                <div
                  className={`text-2xl font-black mt-1 ${
                    remainingBudget >= 0 ? 'text-teal-300' : 'text-rose-400'
                  }`}
                >
                  {remainingBudget < 0 && '-'}{currencySymbol}{Math.abs(remainingBudget).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>{overallPercentage.toFixed(1)}% of budget utilized</span>
                <span>
                  {remainingBudget >= 0 ? `${(100 - overallPercentage).toFixed(1)}% safe` : 'Limit exceeded'}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallPercentage > 100
                      ? 'bg-rose-500'
                      : overallPercentage > 85
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="py-4 text-center space-y-2">
            <p className="text-sm text-slate-300">
              No spending budget set for this month yet.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Setting a monthly budget helps you control expenses and alerts you before you overspend.
            </p>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Configure Budget Limit</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Editing Form */}
      {isEditing && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-lg space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Set Monthly Spending Limit ({currentMonth})
          </h4>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Total Monthly Target ({currencySymbol})
            </label>
            <input
              type="number"
              placeholder="e.g. 20000"
              value={totalLimit}
              onChange={(e) => setTotalLimit(e.target.value)}
              className="w-full px-4 py-2.5 text-base font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Category Limits (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.bgLight} ${cat.textColor}`}>
                    <CategoryIcon categoryId={cat.id} className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                      {cat.name}
                    </div>
                  </div>
                  <input
                    type="number"
                    placeholder="Limit"
                    value={catLimits[cat.id] || ''}
                    onChange={(e) =>
                      setCatLimits({ ...catLimits, [cat.id]: e.target.value })
                    }
                    className="w-24 px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-right text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {hasBudgetSet && (
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              Save Budget
            </button>
          </div>
        </div>
      )}

      {/* Category Budget Breakdown Cards */}
      {hasBudgetSet && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Category Spending vs Budgets
          </h3>

          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const budget = (currentConfig.categoryBudgets && currentConfig.categoryBudgets[cat.id]) || 0;
              const spent = categorySpentMap[cat.id] || 0;
              const percentage = budget > 0 ? (spent / budget) * 100 : 0;
              const isOver = budget > 0 && spent > budget;
              const isNear = budget > 0 && percentage >= 80 && !isOver;

              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${cat.bgLight} ${cat.textColor}`}
                      >
                        <CategoryIcon categoryId={cat.id} className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {budget > 0
                            ? `Budget: ${currencySymbol}${budget.toLocaleString()}`
                            : 'No specific limit set'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900 dark:text-white">
                        {currencySymbol}{spent.toLocaleString()}
                      </div>
                      {budget > 0 && (
                        <div className="text-[10px] font-semibold flex items-center justify-end gap-1">
                          {isOver ? (
                            <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Over by {currencySymbol}{(spent - budget).toLocaleString()}
                            </span>
                          ) : isNear ? (
                            <span className="text-amber-600 dark:text-amber-400">
                              {percentage.toFixed(0)}% used
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> {currencySymbol}{(budget - spent).toLocaleString()} left
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {budget > 0 && (
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver
                            ? 'bg-rose-500'
                            : isNear
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
