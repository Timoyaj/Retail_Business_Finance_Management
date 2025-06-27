import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db, BusinessProfile, Product, Transaction } from '../lib/database';
import { useAuth } from './AuthContext';

export interface BusinessContextType {
  profile: BusinessProfile | null;
  transactions: Transaction[];
  products: Product[];
  isLoading: boolean;
  updateProfile: (profile: Partial<BusinessProfile>, userId?: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'business_id' | 'created_at'>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getFinancialSummary: () => {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    inventoryValue: number;
  };
  refreshData: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load business data when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadBusinessData();
    } else {
      // Clear data when user logs out
      setProfile(null);
      setTransactions([]);
      setProducts([]);
    }
  }, [isAuthenticated, user]);

  const loadBusinessData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load business profile
      const businessProfile = await db.getBusinessByUserId(user.id);
      setProfile(businessProfile);

      if (businessProfile) {
        // Load transactions and products
        const [businessTransactions, businessProducts] = await Promise.all([
          db.getTransactionsByBusinessId(businessProfile.id),
          db.getProductsByBusinessId(businessProfile.id),
        ]);

        setTransactions(businessTransactions);
        setProducts(businessProducts);
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileUpdate: Partial<BusinessProfile>, userId?: string) => {
    const currentUserId = userId || user?.id;
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    if (!profile) {
      // Create new business profile if it doesn't exist
      const newProfile = await db.createBusiness({
        user_id: currentUserId,
        name: profileUpdate.name || 'My Business',
        type: profileUpdate.type || 'general',
        currency: profileUpdate.currency || 'NGN',
        theme: profileUpdate.theme || 'light',
        accent_color: profileUpdate.accent_color || 'primary',
      });
      
      setProfile(newProfile);
      
      // Initialize sample data for new business
      await db.initializeSampleData(newProfile.id);
      
      // Refresh data to show sample data
      await refreshData();
    } else {
      // Update existing profile
      const updatedProfile = await db.updateBusiness(profile.id, profileUpdate);
      setProfile(updatedProfile);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'business_id' | 'created_at'>) => {
    if (!profile) throw new Error('Business profile not found');

    const newTransaction = await db.createTransaction({
      ...transactionData,
      business_id: profile.id,
    });

    setTransactions(prev => [newTransaction, ...prev]);

    // Update product stock if it's a sale
    if (transactionData.type === 'sale') {
      // This is a simplified approach - in a real app, you'd track which products were sold
      // For now, we'll just refresh the data
      await refreshData();
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    if (!profile) throw new Error('Business profile not found');

    const newProduct = await db.createProduct({
      ...productData,
      business_id: profile.id,
    });

    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = async (id: string, productUpdate: Partial<Product>) => {
    const updatedProduct = await db.updateProduct(id, productUpdate);
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? updatedProduct : product
      )
    );
  };

  const deleteProduct = async (id: string) => {
    await db.deleteProduct(id);
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getFinancialSummary = () => {
    const totalRevenue = transactions
      .filter(t => t.type === 'sale' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalRevenue - totalExpenses;

    const inventoryValue = products.reduce(
      (sum, product) => sum + (product.current_stock * product.cost_price), 0
    );

    return { totalRevenue, totalExpenses, netProfit, inventoryValue };
  };

  const refreshData = async () => {
    await loadBusinessData();
  };

  const value = {
    profile,
    transactions,
    products,
    isLoading,
    updateProfile,
    addTransaction,
    addProduct,
    updateProduct,
    deleteProduct,
    getFinancialSummary,
    refreshData,
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
};