import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Transaction {
  id: string;
  type: 'sale' | 'expense' | 'inventory';
  amount: number;
  description: string;
  category: string;
  paymentMethod?: string;
  date: Date;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  lowStockThreshold: number;
  description?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  type: string;
  currency: string;
  theme: 'light' | 'dark';
  accentColor: string;
}

interface BusinessContextType {
  profile: BusinessProfile | null;
  transactions: Transaction[];
  products: Product[];
  updateProfile: (profile: Partial<BusinessProfile>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  getFinancialSummary: () => {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    inventoryValue: number;
  };
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
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const updateProfile = (newProfile: Partial<BusinessProfile>) => {
    setProfile(prev => prev ? { ...prev, ...newProfile } : null);
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productUpdate: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...productUpdate } : product
      )
    );
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
      (sum, product) => sum + (product.currentStock * product.costPrice), 0
    );

    return { totalRevenue, totalExpenses, netProfit, inventoryValue };
  };

  const value = {
    profile,
    transactions,
    products,
    updateProfile,
    addTransaction,
    addProduct,
    updateProduct,
    getFinancialSummary,
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
};