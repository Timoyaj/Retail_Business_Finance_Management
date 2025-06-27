// Local Development Database
// This simulates a real database for development and demonstration
// Can be easily replaced with Supabase when ready for production

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  business_id?: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  name: string;
  type: string;
  currency: string;
  theme: 'light' | 'dark';
  accent_color: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  category: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  low_stock_threshold: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  business_id: string;
  type: 'sale' | 'expense' | 'inventory';
  amount: number;
  description: string;
  category: string;
  payment_method?: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  created_at: string;
}

// Local storage keys
const STORAGE_KEYS = {
  USERS: 'ledgerloom_users',
  BUSINESSES: 'ledgerloom_businesses',
  PRODUCTS: 'ledgerloom_products',
  TRANSACTIONS: 'ledgerloom_transactions',
  CURRENT_USER: 'ledgerloom_current_user',
} as const;

// Utility functions for local storage
class LocalDatabase {
  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage key ${key}:`, error);
    }
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // User operations
  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const users = this.getFromStorage<User>(STORAGE_KEYS.USERS);
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const newUser: User = {
      ...userData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveToStorage(STORAGE_KEYS.USERS, users);
    
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = this.getFromStorage<User>(STORAGE_KEYS.USERS);
    return users.find(u => u.email === email) || null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const users = this.getFromStorage<User>(STORAGE_KEYS.USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveToStorage(STORAGE_KEYS.USERS, users);
    
    return users[userIndex];
  }

  // Business operations
  async createBusiness(businessData: Omit<BusinessProfile, 'id' | 'created_at' | 'updated_at'>): Promise<BusinessProfile> {
    const businesses = this.getFromStorage<BusinessProfile>(STORAGE_KEYS.BUSINESSES);
    
    const newBusiness: BusinessProfile = {
      ...businessData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    businesses.push(newBusiness);
    this.saveToStorage(STORAGE_KEYS.BUSINESSES, businesses);
    
    return newBusiness;
  }

  async getBusinessByUserId(userId: string): Promise<BusinessProfile | null> {
    const businesses = this.getFromStorage<BusinessProfile>(STORAGE_KEYS.BUSINESSES);
    return businesses.find(b => b.user_id === userId) || null;
  }

  async updateBusiness(businessId: string, updates: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const businesses = this.getFromStorage<BusinessProfile>(STORAGE_KEYS.BUSINESSES);
    const businessIndex = businesses.findIndex(b => b.id === businessId);
    
    if (businessIndex === -1) {
      throw new Error('Business not found');
    }

    businesses[businessIndex] = { 
      ...businesses[businessIndex], 
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveToStorage(STORAGE_KEYS.BUSINESSES, businesses);
    
    return businesses[businessIndex];
  }

  // Product operations
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const products = this.getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
    
    const newProduct: Product = {
      ...productData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    products.push(newProduct);
    this.saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    
    return newProduct;
  }

  async getProductsByBusinessId(businessId: string): Promise<Product[]> {
    const products = this.getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
    return products.filter(p => p.business_id === businessId);
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
    const products = this.getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    products[productIndex] = { 
      ...products[productIndex], 
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    
    return products[productIndex];
  }

  async deleteProduct(productId: string): Promise<void> {
    const products = this.getFromStorage<Product>(STORAGE_KEYS.PRODUCTS);
    const filteredProducts = products.filter(p => p.id !== productId);
    this.saveToStorage(STORAGE_KEYS.PRODUCTS, filteredProducts);
  }

  // Transaction operations
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const transactions = this.getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    
    const newTransaction: Transaction = {
      ...transactionData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
    };

    transactions.push(newTransaction);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    
    return newTransaction;
  }

  async getTransactionsByBusinessId(businessId: string): Promise<Transaction[]> {
    const transactions = this.getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    return transactions.filter(t => t.business_id === businessId).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction> {
    const transactions = this.getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }

    transactions[transactionIndex] = { ...transactions[transactionIndex], ...updates };
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    
    return transactions[transactionIndex];
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    const transactions = this.getFromStorage<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    const filteredTransactions = transactions.filter(t => t.id !== transactionId);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, filteredTransactions);
  }

  // Session management
  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Initialize with sample data
  async initializeSampleData(): Promise<void> {
    const users = this.getFromStorage<User>(STORAGE_KEYS.USERS);
    
    // Only initialize if no data exists
    if (users.length === 0) {
      // Create sample user
      const sampleUser = await this.createUser({
        email: 'demo@ledgerloom.com',
        name: 'Demo User',
      });

      // Create sample business
      const sampleBusiness = await this.createBusiness({
        user_id: sampleUser.id,
        name: 'Demo Fashion Boutique',
        type: 'boutique',
        currency: 'NGN',
        theme: 'light',
        accent_color: 'primary',
      });

      // Update user with business_id
      await this.updateUser(sampleUser.id, { business_id: sampleBusiness.id });

      // Create sample products
      const sampleProducts = [
        {
          business_id: sampleBusiness.id,
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
          business_id: sampleBusiness.id,
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
          business_id: sampleBusiness.id,
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
          business_id: sampleBusiness.id,
          type: 'sale' as const,
          amount: 15000,
          description: 'T-shirt sales',
          category: 'clothing',
          payment_method: 'cash',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          status: 'completed' as const,
        },
        {
          business_id: sampleBusiness.id,
          type: 'sale' as const,
          amount: 25000,
          description: 'Jeans and accessories',
          category: 'clothing',
          payment_method: 'card',
          date: new Date().toISOString(),
          status: 'completed' as const,
        },
        {
          business_id: sampleBusiness.id,
          type: 'expense' as const,
          amount: 5000,
          description: 'Electricity bill',
          category: 'utilities',
          date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          status: 'completed' as const,
        },
        {
          business_id: sampleBusiness.id,
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
    }
  }

  // Clear all data (for testing)
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instance
export const localDB = new LocalDatabase();

// Initialize sample data on first load
localDB.initializeSampleData().catch(console.error);