import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db, BusinessProfile, Product, Transaction } from '../lib/database';
import { useAuth } from './AuthContext';
import { useRealtimeTransactions, useRealtimeProducts } from '../hooks/useRealtimeData';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useOptimisticUpdates } from '../hooks/useOptimisticUpdates';
import { useOfflineSync } from '../hooks/useOfflineSync';

export interface BusinessContextType {
  profile: BusinessProfile | null;
  transactions: Transaction[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
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
  clearError: () => void;
  retryLastAction: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, error, clearError, retry } = useErrorHandler();
  const { queueAction } = useOfflineSync();

  // Use real-time data hooks
  const {
    data: realtimeTransactions,
    isLoading: transactionsLoading,
    error: transactionsError
  } = useRealtimeTransactions(profile?.id || '');

  const {
    data: realtimeProducts,
    isLoading: productsLoading,
    error: productsError
  } = useRealtimeProducts(profile?.id || '');

  // Use optimistic updates for better UX
  const {
    data: transactions,
    setData: setTransactions,
    addOptimisticUpdate: addOptimisticTransaction,
    isPending: isTransactionPending
  } = useOptimisticUpdates<Transaction>(realtimeTransactions);

  const {
    data: products,
    setData: setProducts,
    addOptimisticUpdate: addOptimisticProduct,
    isPending: isProductPending
  } = useOptimisticUpdates<Product>(realtimeProducts);

  // Update local state when real-time data changes
  useEffect(() => {
    setTransactions(realtimeTransactions);
  }, [realtimeTransactions, setTransactions]);

  useEffect(() => {
    setProducts(realtimeProducts);
  }, [realtimeProducts, setProducts]);

  // Handle real-time errors
  useEffect(() => {
    if (transactionsError) {
      handleError(transactionsError);
    }
  }, [transactionsError, handleError]);

  useEffect(() => {
    if (productsError) {
      handleError(productsError);
    }
  }, [productsError, handleError]);

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
    } catch (err) {
      handleError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileUpdate: Partial<BusinessProfile>, userId?: string) => {
    const currentUserId = userId || user?.id;
    
    if (!currentUserId) {
      throw new Error('User not authenticated');
    }

    try {
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
      } else {
        // Update existing profile
        const updatedProfile = await db.updateBusiness(profile.id, profileUpdate);
        setProfile(updatedProfile);
      }
    } catch (err) {
      handleError(err as Error);
      throw err;
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'business_id' | 'created_at'>) => {
    if (!profile) throw new Error('Business profile not found');

    const tempTransaction: Transaction = {
      id: `temp_${Date.now()}`,
      business_id: profile.id,
      created_at: new Date().toISOString(),
      ...transactionData,
    };

    // Add optimistic update
    addOptimisticTransaction('create', tempTransaction, async () => {
      try {
        const newTransaction = await db.createTransaction({
          ...transactionData,
          business_id: profile.id,
        });
        return newTransaction;
      } catch (err) {
        // Queue for offline sync if network error
        if (!navigator.onLine) {
          queueAction('create', 'transactions', {
            ...transactionData,
            business_id: profile.id,
          });
        }
        throw err;
      }
    });
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    if (!profile) throw new Error('Business profile not found');

    const tempProduct: Product = {
      id: `temp_${Date.now()}`,
      business_id: profile.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...productData,
    };

    addOptimisticProduct('create', tempProduct, async () => {
      try {
        const newProduct = await db.createProduct({
          ...productData,
          business_id: profile.id,
        });
        return newProduct;
      } catch (err) {
        if (!navigator.onLine) {
          queueAction('create', 'products', {
            ...productData,
            business_id: profile.id,
          });
        }
        throw err;
      }
    });
  };

  const updateProduct = async (id: string, productUpdate: Partial<Product>) => {
    const existingProduct = products.find(p => p.id === id);
    if (!existingProduct) throw new Error('Product not found');

    const updatedProduct = { ...existingProduct, ...productUpdate };

    addOptimisticProduct('update', updatedProduct, async () => {
      try {
        const result = await db.updateProduct(id, productUpdate);
        return result;
      } catch (err) {
        if (!navigator.onLine) {
          queueAction('update', 'products', { id, ...productUpdate });
        }
        throw err;
      }
    });
  };

  const deleteProduct = async (id: string) => {
    const existingProduct = products.find(p => p.id === id);
    if (!existingProduct) throw new Error('Product not found');

    addOptimisticProduct('delete', existingProduct, async () => {
      try {
        await db.deleteProduct(id);
        return existingProduct;
      } catch (err) {
        if (!navigator.onLine) {
          queueAction('delete', 'products', { id });
        }
        throw err;
      }
    });
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

  const retryLastAction = async () => {
    return retry(loadBusinessData);
  };

  const value = {
    profile,
    transactions,
    products,
    isLoading: isLoading || transactionsLoading || productsLoading,
    error: error?.message || null,
    updateProfile,
    addTransaction,
    addProduct,
    updateProduct,
    deleteProduct,
    getFinancialSummary,
    refreshData,
    clearError,
    retryLastAction,
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
};