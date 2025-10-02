import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, MonthlyBudget, ExpenseCategory, Transaction, Goal } from '../lib/supabase';
import { LogOut, Plus, TrendingUp, Target, PiggyBank } from 'lucide-react';
import BudgetSetup from './BudgetSetup';
import ExpenseList from './ExpenseList';
import GoalsList from './GoalsList';
import BudgetOverview from './BudgetOverview';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentBudget, setCurrentBudget] = useState<MonthlyBudget | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'goals'>('overview');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

      const [budgetRes, categoriesRes, transactionsRes, goalsRes] = await Promise.all([
        supabase
          .from('monthly_budgets')
          .select('*')
          .eq('user_id', user.id)
          .eq('month', currentMonth)
          .maybeSingle(),
        supabase
          .from('expense_categories')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at'),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .gte('transaction_date', currentMonth)
          .order('transaction_date', { ascending: false }),
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at'),
      ]);

      if (budgetRes.data) {
        setCurrentBudget(budgetRes.data);
      } else {
        setShowBudgetSetup(true);
      }

      setCategories(categoriesRes.data || []);
      setTransactions(transactionsRes.data || []);
      setGoals(goalsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetCreated = () => {
    setShowBudgetSetup(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your budget...</p>
        </div>
      </div>
    );
  }

  if (showBudgetSetup || !currentBudget) {
    return <BudgetSetup onComplete={handleBudgetCreated} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-lg">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SmartBudget Planner</h1>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`pb-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'expenses'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Expenses
              </div>
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`pb-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'goals'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Goals
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && (
          <BudgetOverview
            budget={currentBudget}
            categories={categories}
            transactions={transactions}
            goals={goals}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseList
            categories={categories}
            transactions={transactions}
            onUpdate={loadData}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsList goals={goals} onUpdate={loadData} />
        )}
      </div>
    </div>
  );
}
