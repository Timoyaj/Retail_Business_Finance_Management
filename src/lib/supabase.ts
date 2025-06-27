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
      inventory_movements: {
        Row: {
          id: string;
          product_id: string;
          movement_type: 'purchase' | 'sale' | 'adjustment' | 'transfer';
          quantity: number;
          unit_cost: number;
          total_cost: number;
          reference_id: string | null;
          date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          movement_type: 'purchase' | 'sale' | 'adjustment' | 'transfer';
          quantity: number;
          unit_cost?: number;
          total_cost?: number;
          reference_id?: string | null;
          date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          movement_type?: 'purchase' | 'sale' | 'adjustment' | 'transfer';
          quantity?: number;
          unit_cost?: number;
          total_cost?: number;
          reference_id?: string | null;
          date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      inventory_layers: {
        Row: {
          id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          purchase_date: string;
          remaining_quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          purchase_date: string;
          remaining_quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          quantity?: number;
          unit_cost?: number;
          total_cost?: number;
          purchase_date?: string;
          remaining_quantity?: number;
          created_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          payment_terms: string;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          payment_terms?: string;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          payment_terms?: string;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_orders: {
        Row: {
          id: string;
          business_id: string;
          supplier_id: string;
          po_number: string;
          status: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
          order_date: string;
          expected_delivery_date: string | null;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          supplier_id: string;
          po_number: string;
          status?: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
          order_date?: string;
          expected_delivery_date?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          supplier_id?: string;
          po_number?: string;
          status?: 'draft' | 'sent' | 'confirmed' | 'partially_received' | 'received' | 'cancelled';
          order_date?: string;
          expected_delivery_date?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_order_items: {
        Row: {
          id: string;
          purchase_order_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          quantity_received: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_order_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          quantity_received?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          purchase_order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_cost?: number;
          total_cost?: number;
          quantity_received?: number;
          created_at?: string;
        };
      };
      stock_receipts: {
        Row: {
          id: string;
          business_id: string;
          purchase_order_id: string | null;
          receipt_number: string;
          receipt_date: string;
          received_by: string | null;
          status: 'pending' | 'completed' | 'cancelled';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          purchase_order_id?: string | null;
          receipt_number: string;
          receipt_date?: string;
          received_by?: string | null;
          status?: 'pending' | 'completed' | 'cancelled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          purchase_order_id?: string | null;
          receipt_number?: string;
          receipt_date?: string;
          received_by?: string | null;
          status?: 'pending' | 'completed' | 'cancelled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_receipt_items: {
        Row: {
          id: string;
          stock_receipt_id: string;
          purchase_order_item_id: string | null;
          product_id: string;
          quantity_ordered: number;
          quantity_received: number;
          unit_cost: number;
          total_cost: number;
          variance_quantity: number;
          variance_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          stock_receipt_id: string;
          purchase_order_item_id?: string | null;
          product_id: string;
          quantity_ordered?: number;
          quantity_received: number;
          unit_cost: number;
          total_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          stock_receipt_id?: string;
          purchase_order_item_id?: string | null;
          product_id?: string;
          quantity_ordered?: number;
          quantity_received?: number;
          unit_cost?: number;
          total_cost?: number;
          created_at?: string;
        };
      };
    };
  };
}