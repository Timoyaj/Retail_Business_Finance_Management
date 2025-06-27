import { supabase } from './supabase';
import { accountsService } from './accounts';
import type { Database } from './supabase';

// Type aliases for easier use
export type User = Database['public']['Tables']['profiles']['Row'];
export type BusinessProfile = Database['public']['Tables']['business_profiles']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

// Database service class
class DatabaseService {
  // User operations
  async createUser(userData: { email: string; name: string }): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: 'temp-password-123', // In production, this would be the actual password
      options: {
        data: {
          name: userData.name,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new Error('User already exists with this email');
      }
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Failed to create user');
    }

    // Get the created profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to retrieve user profile');
    }

    return profile;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No user found
      }
      throw new Error(error.message);
    }

    return data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return profile;
  }

  // Authentication operations
  async signIn(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Failed to sign in');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new Error('Failed to retrieve user profile');
    }

    return profile;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  // Business operations
  async createBusiness(businessData: Database['public']['Tables']['business_profiles']['Insert']): Promise<BusinessProfile> {
    const { data, error } = await supabase
      .from('business_profiles')
      .insert(businessData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Initialize default chart of accounts for the new business
    try {
      await accountsService.initializeDefaultAccounts(data.id, businessData.type || 'general');
    } catch (accountError) {
      console.error('Error initializing chart of accounts:', accountError);
      // Don't throw error here as business creation was successful
    }

    return data;
  }

  async getBusinessByUserId(userId: string): Promise<BusinessProfile | null> {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No business found
      }
      throw new Error(error.message);
    }

    return data;
  }

  async updateBusiness(businessId: string, updates: Database['public']['Tables']['business_profiles']['Update']): Promise<BusinessProfile> {
    const { data, error } = await supabase
      .from('business_profiles')
      .update(updates)
      .eq('id', businessId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Product operations
  async createProduct(productData: Database['public']['Tables']['products']['Insert']): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getProductsByBusinessId(businessId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async updateProduct(productId: string, updates: Database['public']['Tables']['products']['Update']): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Transaction operations
  async createTransaction(transactionData: Database['public']['Tables']['transactions']['Insert']): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getTransactionsByBusinessId(businessId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async updateTransaction(transactionId: string, updates: Database['public']['Tables']['transactions']['Update']): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Category operations
  async createCategory(categoryData: Database['public']['Tables']['categories']['Insert']): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getCategoriesByBusinessId(businessId: string, type?: 'product' | 'expense' | 'income'): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('business_id', businessId);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Initialize sample data for new businesses
  async initializeSampleData(businessId: string): Promise<void> {
    try {
      // Create sample products
      const sampleProducts = [
        {
          business_id: businessId,
          name: 'Cotton T-Shirt',
          sku: 'TS001',
          category: 'clothing',
          cost_price: 2500,
          selling_price: 5000,
          current_stock: 50,
          low_stock_threshold: 10,
          description: 'Comfortable cotton t-shirt in various colors',
        },
        {
          business_id: businessId,
          name: 'Denim Jeans',
          sku: 'DJ001',
          category: 'clothing',
          cost_price: 8000,
          selling_price: 15000,
          current_stock: 5,
          low_stock_threshold: 10,
          description: 'Premium denim jeans',
        },
        {
          business_id: businessId,
          name: 'Leather Handbag',
          sku: 'LH001',
          category: 'accessories',
          cost_price: 12000,
          selling_price: 25000,
          current_stock: 15,
          low_stock_threshold: 5,
          description: 'Genuine leather handbag',
        },
      ];

      for (const product of sampleProducts) {
        await this.createProduct(product);
      }

      // Create sample transactions
      const sampleTransactions = [
        {
          business_id: businessId,
          type: 'sale' as const,
          amount: 15000,
          description: 'T-shirt sales',
          category: 'clothing',
          payment_method: 'cash',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          status: 'completed' as const,
        },
        {
          business_id: businessId,
          type: 'sale' as const,
          amount: 25000,
          description: 'Jeans and accessories',
          category: 'clothing',
          payment_method: 'card',
          date: new Date().toISOString(),
          status: 'completed' as const,
        },
        {
          business_id: businessId,
          type: 'expense' as const,
          amount: 5000,
          description: 'Electricity bill',
          category: 'utilities',
          date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          status: 'completed' as const,
        },
        {
          business_id: businessId,
          type: 'expense' as const,
          amount: 50000,
          description: 'Monthly rent',
          category: 'rent',
          date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
          status: 'completed' as const,
        },
      ];

      for (const transaction of sampleTransactions) {
        await this.createTransaction(transaction);
      }

      // Create sample categories
      const sampleCategories = [
        { business_id: businessId, name: 'Clothing', type: 'product' as const, color: '#3b82f6' },
        { business_id: businessId, name: 'Accessories', type: 'product' as const, color: '#10b981' },
        { business_id: businessId, name: 'Utilities', type: 'expense' as const, color: '#f59e0b' },
        { business_id: businessId, name: 'Rent', type: 'expense' as const, color: '#ef4444' },
        { business_id: businessId, name: 'Marketing', type: 'expense' as const, color: '#8b5cf6' },
      ];

      for (const category of sampleCategories) {
        await this.createCategory(category);
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
      // Don't throw error here as it's not critical for the app to function
    }
  }
}

// Export singleton instance
export const db = new DatabaseService();