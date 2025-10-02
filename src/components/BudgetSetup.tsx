import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { DollarSign, Percent } from 'lucide-react';

type BudgetSetupProps = {
  onComplete: () => void;
};

export default function BudgetSetup({ onComplete }: BudgetSetupProps) {
  const { user } = useAuth();
  const [income, setIncome] = useState('');
  const [savingsPercent, setSavingsPercent] = useState('10');
  const [groceriesAmount, setGroceriesAmount] = useState('500');
  const [contingencyPercent, setContingencyPercent] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      const incomeNum = parseFloat(income);
      const savingsPercentNum = parseFloat(savingsPercent);
      const groceriesNum = parseFloat(groceriesAmount);
      const contingencyPercentNum = parseFloat(contingencyPercent);

      const { error: budgetError } = await supabase.from('monthly_budgets').insert([
        {
          user_id: user.id,
          month: currentMonth,
          income: incomeNum,
          savings_percentage: savingsPercentNum,
          groceries_allocation: groceriesNum,
          contingency_percentage: contingencyPercentNum,
        },
      ]);

      if (budgetError) throw budgetError;

      const savingsAmount = (incomeNum * savingsPercentNum) / 100;
      const contingencyAmount = (incomeNum * contingencyPercentNum) / 100;

      const categories = [
        { name: 'Savings', allocated_amount: savingsAmount, color: '#10b981', is_system: true },
        { name: 'Groceries', allocated_amount: groceriesNum, color: '#f59e0b', is_system: true },
        { name: 'Bills', allocated_amount: 0, color: '#ef4444', is_system: true },
        { name: 'Transport', allocated_amount: 0, color: '#3b82f6', is_system: true },
        { name: 'Entertainment', allocated_amount: 0, color: '#8b5cf6', is_system: true },
        { name: 'Contingency', allocated_amount: contingencyAmount, color: '#ec4899', is_system: true },
      ];

      const { error: categoriesError } = await supabase.from('expense_categories').insert(
        categories.map((cat) => ({
          ...cat,
          user_id: user.id,
        }))
      );

      if (categoriesError) throw categoriesError;

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  const calculateRemaining = () => {
    const incomeNum = parseFloat(income) || 0;
    const savingsPercentNum = parseFloat(savingsPercent) || 0;
    const groceriesNum = parseFloat(groceriesAmount) || 0;
    const contingencyPercentNum = parseFloat(contingencyPercent) || 0;

    const savings = (incomeNum * savingsPercentNum) / 100;
    const contingency = (incomeNum * contingencyPercentNum) / 100;
    const allocated = savings + groceriesNum + contingency;

    return incomeNum - allocated;
  };

  const remaining = calculateRemaining();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Monthly Budget</h2>
        <p className="text-gray-600 mb-8">
          Let's configure your budget for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Income
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="income"
                type="number"
                step="0.01"
                min="0"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="5000.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="savings" className="block text-sm font-medium text-gray-700 mb-2">
                Savings Percentage
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="savings"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={savingsPercent}
                  onChange={(e) => setSavingsPercent(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="groceries" className="block text-sm font-medium text-gray-700 mb-2">
                Groceries Budget
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="groceries"
                  type="number"
                  step="0.01"
                  min="0"
                  value={groceriesAmount}
                  onChange={(e) => setGroceriesAmount(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="500.00"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="contingency" className="block text-sm font-medium text-gray-700 mb-2">
              Contingency Fund Percentage
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="contingency"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={contingencyPercent}
                onChange={(e) => setContingencyPercent(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="10"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Remaining for other expenses:</span>
              <span className={`text-lg font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${remaining.toFixed(2)}
              </span>
            </div>
            {income && (
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Savings ({savingsPercent}%):</span>
                  <span>${((parseFloat(income) * parseFloat(savingsPercent)) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Groceries:</span>
                  <span>${parseFloat(groceriesAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contingency ({contingencyPercent}%):</span>
                  <span>${((parseFloat(income) * parseFloat(contingencyPercent)) / 100).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || remaining < 0}
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Budget...' : 'Create Budget'}
          </button>
        </form>
      </div>
    </div>
  );
}
