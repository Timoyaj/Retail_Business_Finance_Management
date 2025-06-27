import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      business_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          currency: string;
          theme: 'light' | 'dark';
          accent_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: string;
          currency?: string;
          theme?: 'light' | 'dark';
          accent_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          currency?: string;
          theme?: 'light' | 'dark';
          accent_color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          sku: string;
          category: string;
          cost_price: number;
          selling_price: number;
          current_stock: number;
          low_stock_threshold: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          sku: string;
          category?: string;
          cost_price?: number;
          selling_price?: number;
          current_stock?: number;
          low_stock_threshold?: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          sku?: string;
          category?: string;
          cost_price?: number;
          selling_price?: number;
          current_stock?: number;
          low_stock_threshold?: number;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          business_id: string;
          type: 'sale' | 'expense' | 'inventory';
          amount: number;
          description: string;
          category: string;
          payment_method: string | null;
          date: string;
          status: 'completed' | 'pending' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          type: 'sale' | 'expense' | 'inventory';
          amount: number;
          description: string;
          category: string;
          payment_method?: string | null;
          date?: string;
          status?: 'completed' | 'pending' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          type?: 'sale' | 'expense' | 'inventory';
          amount?: number;
          description?: string;
          category?: string;
          payment_method?: string | null;
          date?: string;
          status?: 'completed' | 'pending' | 'cancelled';
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          type: 'product' | 'expense' | 'income';
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          type: 'product' | 'expense' | 'income';
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          type?: 'product' | 'expense' | 'income';
          color?: string;
          created_at?: string;
        };
      };
      account_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          normal_balance: 'debit' | 'credit';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          normal_balance: 'debit' | 'credit';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          normal_balance?: 'debit' | 'credit';
          created_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          business_id: string;
          account_type_id: string;
          code: string;
          name: string;
          description: string | null;
          parent_account_id: string | null;
          is_active: boolean;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          account_type_id: string;
          code: string;
          name: string;
          description?: string | null;
          parent_account_id?: string | null;
          is_active?: boolean;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          account_type_id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          parent_account_id?: string | null;
          is_active?: boolean;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      account_balances: {
        Row: {
          id: string;
          account_id: string;
          period_start: string;
          period_end: string;
          opening_balance: number;
          closing_balance: number;
          total_debits: number;
          total_credits: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          period_start: string;
          period_end: string;
          opening_balance?: number;
          closing_balance?: number;
          total_debits?: number;
          total_credits?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          period_start?: string;
          period_end?: string;
          opening_balance?: number;
          closing_balance?: number;
          total_debits?: number;
          total_credits?: number;
          created_at?: string;
        };
      };
    };
  };
}