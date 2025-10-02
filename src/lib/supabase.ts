import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
};

export type MonthlyBudget = {
  id: string;
  user_id: string;
  month: string;
  income: number;
  savings_percentage: number;
  groceries_allocation: number;
  contingency_percentage: number;
  created_at: string;
  updated_at: string;
};

export type ExpenseCategory = {
  id: string;
  user_id: string;
  name: string;
  allocated_amount: number;
  color: string;
  is_system: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_allocation: number;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
