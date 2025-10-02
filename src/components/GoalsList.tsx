import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Goal } from '../lib/supabase';
import { Plus, Trash2, CreditCard as Edit2, X, DollarSign, Target } from 'lucide-react';

type GoalsListProps = {
  goals: Goal[];
  onUpdate: () => void;
};

export default function GoalsList({ goals, onUpdate }: GoalsListProps) {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showContributeModal, setShowContributeModal] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    monthly_allocation: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('goals')
          .update({
            name: formData.name,
            target_amount: parseFloat(formData.target_amount),
            monthly_allocation: parseFloat(formData.monthly_allocation),
            deadline: formData.deadline || null,
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('goals').insert([
          {
            user_id: user.id,
            name: formData.name,
            target_amount: parseFloat(formData.target_amount),
            monthly_allocation: parseFloat(formData.monthly_allocation),
            deadline: formData.deadline || null,
            is_active: true,
          },
        ]);

        if (error) throw error;
      }

      setFormData({
        name: '',
        target_amount: '',
        monthly_allocation: '',
        deadline: '',
      });
      setShowAddForm(false);
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal: Goal) => {
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      monthly_allocation: goal.monthly_allocation.toString(),
      deadline: goal.deadline || '',
    });
    setEditingId(goal.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase.from('goals').update({ is_active: false }).eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      target_amount: '',
      monthly_allocation: '',
      deadline: '',
    });
  };

  const handleContribute = async (goalId: string) => {
    if (!user || !contributionAmount) return;

    setLoading(true);
    try {
      const amount = parseFloat(contributionAmount);

      const { data: goal } = await supabase
        .from('goals')
        .select('current_amount')
        .eq('id', goalId)
        .single();

      if (!goal) throw new Error('Goal not found');

      const { error } = await supabase
        .from('goals')
        .update({
          current_amount: parseFloat(goal.current_amount.toString()) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId);

      if (error) throw error;

      setShowContributeModal(null);
      setContributionAmount('');
      onUpdate();
    } catch (error) {
      console.error('Error contributing to goal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? 'Edit Goal' : 'New Goal'}
            </h3>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Family Trip to Europe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount
                </label>
                <input
                  id="target"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="5000.00"
                />
              </div>

              <div>
                <label htmlFor="monthly" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Allocation
                </label>
                <input
                  id="monthly"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthly_allocation}
                  onChange={(e) => setFormData({ ...formData, monthly_allocation: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="200.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Deadline (Optional)
              </label>
              <input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : editingId ? 'Update Goal' : 'Add Goal'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No goals yet.</p>
            <p className="text-sm mt-1">Click "Add Goal" to create your first savings goal.</p>
          </div>
        ) : (
          goals.map((goal) => {
            const current = parseFloat(goal.current_amount.toString());
            const target = parseFloat(goal.target_amount.toString());
            const percentage = (current / target) * 100;
            const remaining = target - current;
            const monthlyAllocation = parseFloat(goal.monthly_allocation.toString());
            const monthsRemaining = monthlyAllocation > 0 ? Math.ceil(remaining / monthlyAllocation) : 0;

            return (
              <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                    {goal.deadline && (
                      <p className="text-sm text-gray-500 mt-1">
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ${current.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">of ${target.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% complete</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-semibold text-gray-900">${remaining.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Allocation:</span>
                      <span className="font-semibold text-gray-900">${monthlyAllocation.toFixed(2)}</span>
                    </div>
                    {monthsRemaining > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Months to Goal:</span>
                        <span className="font-semibold text-gray-900">{monthsRemaining}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowContributeModal(goal.id)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition"
                  >
                    <DollarSign className="w-4 h-4" />
                    Add Contribution
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showContributeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Contribution</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="contribution" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  id="contribution"
                  type="number"
                  step="0.01"
                  min="0"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="100.00"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleContribute(showContributeModal)}
                  disabled={loading || !contributionAmount}
                  className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Contribution'}
                </button>
                <button
                  onClick={() => {
                    setShowContributeModal(null);
                    setContributionAmount('');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
