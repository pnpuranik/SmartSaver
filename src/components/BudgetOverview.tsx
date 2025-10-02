import { MonthlyBudget, ExpenseCategory, Transaction, Goal } from '../lib/supabase';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

type BudgetOverviewProps = {
  budget: MonthlyBudget;
  categories: ExpenseCategory[];
  transactions: Transaction[];
  goals: Goal[];
};

export default function BudgetOverview({ budget, categories, transactions, goals }: BudgetOverviewProps) {
  const calculateCategorySpending = (categoryId: string) => {
    return transactions
      .filter((t) => t.category_id === categoryId)
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  };

  const totalSpent = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalAllocated = categories.reduce((sum, c) => sum + parseFloat(c.allocated_amount.toString()), 0);
  const remainingBudget = parseFloat(budget.income.toString()) - totalSpent;
  const savingsAmount = (parseFloat(budget.income.toString()) * parseFloat(budget.savings_percentage.toString())) / 100;
  const totalGoalsTarget = goals.reduce((sum, g) => sum + parseFloat(g.target_amount.toString()), 0);
  const totalGoalsCurrent = goals.reduce((sum, g) => sum + parseFloat(g.current_amount.toString()), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Monthly Income</span>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${parseFloat(budget.income.toString()).toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Spent</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((totalSpent / parseFloat(budget.income.toString())) * 100).toFixed(1)}% of income
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Remaining</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className={`text-3xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${remainingBudget.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Savings Goal</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${savingsAmount.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{budget.savings_percentage}% of income</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h3>
          <div className="space-y-4">
            {categories.map((category) => {
              const spent = calculateCategorySpending(category.id);
              const allocated = parseFloat(category.allocated_amount.toString());
              const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
              const isOverBudget = spent > allocated;

              return (
                <div key={category.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                        ${spent.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500"> / ${allocated.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  {isOverBudget && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-600">Over budget by ${(spent - allocated).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Goals</h3>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No active goals yet.</p>
              <p className="text-sm mt-1">Switch to the Goals tab to create one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const current = parseFloat(goal.current_amount.toString());
                const target = parseFloat(goal.target_amount.toString());
                const percentage = (current / target) * 100;

                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">${current.toFixed(2)}</span>
                        <span className="text-xs text-gray-500"> / ${target.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{percentage.toFixed(1)}% complete</span>
                      {goal.deadline && (
                        <span className="text-xs text-gray-500">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions yet this month.</p>
            <p className="text-sm mt-1">Switch to the Expenses tab to add one.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => {
              const category = categories.find((c) => c.id === transaction.category_id);
              return (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    {category && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description || 'Untitled'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {category?.name || 'Uncategorized'} • {new Date(transaction.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${parseFloat(transaction.amount.toString()).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
