'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Store, InventoryBatch, Sale, Expense, StoreState } from '@/types/store';

interface Recommendation {
  id: string;
  type: 'leak' | 'optimization' | 'success';
  title: string;
  description: string;
  impact: string;
  storeId: string;
  batchId?: string;
}

interface StoreContextType {
  state: StoreState;
  registerUser: (username: string, email: string) => User | null;
  loginUser: (email: string) => boolean;
  logoutUser: () => void;
  createStore: (name: string, description: string) => Store;
  deleteStore: (storeId: string) => void;
  setActiveStore: (storeId: string) => void;
  addBatch: (
    goodsName: string,
    category: string,
    quantityPurchased: number,
    purchaseCostPerUnit: number,
    sellingPricePerUnit: number,
    dateBrought: string
  ) => InventoryBatch;
  deleteBatch: (batchId: string) => void;
  recordSale: (
    batchId: string,
    quantitySold: number,
    salePricePerUnit: number,
    dateSold: string
  ) => Sale | null;
  recordExpense: (
    batchId: string,
    description: string,
    amount: number,
    dateIncurred: string
  ) => Expense | null;
  getStoreRecommendations: () => Recommendation[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'businesstracker_state_v1';

const initialEmptyState: StoreState = {
  users: [],
  currentUser: null,
  stores: [],
  activeStoreId: null,
  batches: [],
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StoreState>(initialEmptyState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          setState(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse local storage state', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Auth Operations
  const registerUser = (username: string, email: string): User | null => {
    if (!username || !email) return null;
    const exists = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return null;

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      email,
    };

    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUser: newUser,
    }));

    return newUser;
  };

  const loginUser = (email: string): boolean => {
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setState(prev => ({
        ...prev,
        currentUser: user,
      }));
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setState(prev => ({
      ...prev,
      currentUser: null,
      activeStoreId: null,
    }));
  };

  // Store Operations
  const createStore = (name: string, description: string): Store => {
    const newStore: Store = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      stores: [...prev.stores, newStore],
      activeStoreId: prev.activeStoreId || newStore.id,
    }));

    return newStore;
  };

  const deleteStore = (storeId: string) => {
    setState(prev => {
      const filteredStores = prev.stores.filter(s => s.id !== storeId);
      const filteredBatches = prev.batches.filter(b => b.storeId !== storeId);
      let nextActive = prev.activeStoreId;
      if (nextActive === storeId) {
        nextActive = filteredStores.length > 0 ? filteredStores[0].id : null;
      }
      return {
        ...prev,
        stores: filteredStores,
        batches: filteredBatches,
        activeStoreId: nextActive,
      };
    });
  };

  const setActiveStore = (storeId: string) => {
    setState(prev => ({
      ...prev,
      activeStoreId: storeId,
    }));
  };

  // Inventory Batch Operations
  const addBatch = (
    goodsName: string,
    category: string,
    quantityPurchased: number,
    purchaseCostPerUnit: number,
    sellingPricePerUnit: number,
    dateBrought: string
  ): InventoryBatch => {
    if (!state.activeStoreId) throw new Error('No active store selected');

    const newBatch: InventoryBatch = {
      id: crypto.randomUUID(),
      storeId: state.activeStoreId,
      goodsName,
      category,
      quantityPurchased,
      quantitySold: 0,
      purchaseCostPerUnit,
      totalPurchaseCost: quantityPurchased * purchaseCostPerUnit,
      sellingPricePerUnit,
      dateBrought,
      completedAt: null,
      sales: [],
      expenses: [],
    };

    setState(prev => ({
      ...prev,
      batches: [...prev.batches, newBatch],
    }));

    return newBatch;
  };

  const deleteBatch = (batchId: string) => {
    setState(prev => ({
      ...prev,
      batches: prev.batches.filter(b => b.id !== batchId),
    }));
  };

  // Sales Records
  const recordSale = (
    batchId: string,
    quantitySold: number,
    salePricePerUnit: number,
    dateSold: string
  ): Sale | null => {
    const batch = state.batches.find(b => b.id === batchId);
    if (!batch) return null;

    const remainingQty = batch.quantityPurchased - batch.quantitySold;
    if (quantitySold > remainingQty) return null;

    const totalRevenue = quantitySold * salePricePerUnit;
    const newSale: Sale = {
      id: crypto.randomUUID(),
      batchId,
      quantitySold,
      salePricePerUnit,
      totalRevenue,
      dateSold,
    };

    setState(prev => {
      const updatedBatches = prev.batches.map(b => {
        if (b.id === batchId) {
          const newQtySold = b.quantitySold + quantitySold;
          const isFullySold = newQtySold === b.quantityPurchased;
          return {
            ...b,
            quantitySold: newQtySold,
            completedAt: isFullySold ? dateSold : b.completedAt,
            sales: [...b.sales, newSale],
          };
        }
        return b;
      });

      return {
        ...prev,
        batches: updatedBatches,
      };
    });

    return newSale;
  };

  // Expense Records
  const recordExpense = (
    batchId: string,
    description: string,
    amount: number,
    dateIncurred: string
  ): Expense | null => {
    const batch = state.batches.find(b => b.id === batchId);
    if (!batch) return null;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      batchId,
      description,
      amount,
      dateIncurred,
    };

    setState(prev => {
      const updatedBatches = prev.batches.map(b => {
        if (b.id === batchId) {
          return {
            ...b,
            expenses: [...b.expenses, newExpense],
          };
        }
        return b;
      });

      return {
        ...prev,
        batches: updatedBatches,
      };
    });

    return newExpense;
  };

  // AI Recommendation Engine / Heuristics for Revenue Leaks and Optimizations
  const getStoreRecommendations = (): Recommendation[] => {
    if (!state.activeStoreId) return [];

    const storeBatches = state.batches.filter(b => b.storeId === state.activeStoreId);
    const recommendations: Recommendation[] = [];

    storeBatches.forEach(batch => {
      const totalRevenue = batch.sales.reduce((sum, s) => sum + s.totalRevenue, 0);
      const totalExpenses = batch.expenses.reduce((sum, e) => sum + e.amount, 0);
      const remainingQty = batch.quantityPurchased - batch.quantitySold;
      const isCompleted = batch.completedAt !== null;

      // Calculate timeline details
      const dateBrought = new Date(batch.dateBrought);
      const today = new Date();
      const batchAgeDays = Math.ceil((today.getTime() - dateBrought.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate sell-through rate
      const sellThroughPercent = (batch.quantitySold / batch.quantityPurchased) * 100;

      // Rule 1: High Expenses (Revenue Leak)
      if (totalExpenses > 0 && totalRevenue > 0) {
        const expenseToRevenueRatio = totalExpenses / totalRevenue;
        if (expenseToRevenueRatio > 0.2) {
          recommendations.push({
            id: `leak-expense-${batch.id}`,
            type: 'leak',
            title: 'High Batch Expense Overhead',
            description: `Batch "${batch.goodsName}" has accumulated ₦${totalExpenses} in expenses, which represents ${(expenseToRevenueRatio * 100).toFixed(0)}% of sales revenue.`,
            impact: 'Reduce logistical costs, packing fees, or delivery premiums for this batch.',
            storeId: batch.storeId,
            batchId: batch.id,
          });
        }
      }

      // Rule 2: Underpricing / Fast Sellout (Profit Optimization)
      if (isCompleted && batch.completedAt) {
        const completedDate = new Date(batch.completedAt);
        const turnaroundDays = Math.ceil((completedDate.getTime() - dateBrought.getTime()) / (1000 * 60 * 60 * 24));
        if (turnaroundDays <= 3) {
          recommendations.push({
            id: `opt-price-${batch.id}`,
            type: 'optimization',
            title: 'Underpriced Goods Alert',
            description: `Batch "${batch.goodsName}" sold out completely in only ${turnaroundDays} day(s). The demand was exceptionally high at ₦${batch.sellingPricePerUnit}/unit.`,
            impact: `Increase the selling price of "${batch.goodsName}" by 10%–15% for the next incoming batch.`,
            storeId: batch.storeId,
            batchId: batch.id,
          });
        }
      }

      // Rule 3: Aging Stock (Revenue Leak)
      if (!isCompleted && batchAgeDays > 30 && sellThroughPercent < 50) {
        recommendations.push({
          id: `leak-aging-${batch.id}`,
          type: 'leak',
          title: 'Aging / Slow-Moving Inventory',
          description: `Batch "${batch.goodsName}" has been in stock for ${batchAgeDays} days, but only ${sellThroughPercent.toFixed(0)}% has been sold. Remaining stock: ${remainingQty} units.`,
          impact: 'Launch a discount bundle or a buy-one-get-one promotion to release stuck capital.',
          storeId: batch.storeId,
          batchId: batch.id,
        });
      }

      // Rule 4: High Sales Velocity, High Margin (Success / Benchmark)
      if (sellThroughPercent > 75 && !isCompleted && batchAgeDays <= 14) {
        const unitsCost = batch.quantitySold * batch.purchaseCostPerUnit;
        const grossProfit = totalRevenue - unitsCost;
        const netProfit = grossProfit - totalExpenses;
        const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        if (margin > 30) {
          recommendations.push({
            id: `success-perform-${batch.id}`,
            type: 'success',
            title: 'High Performing Product',
            description: `Batch "${batch.goodsName}" is performing exceptionally well with ${sellThroughPercent.toFixed(0)}% sold in ${batchAgeDays} days, maintaining a net profit margin of ${margin.toFixed(0)}%.`,
            impact: 'Restock this item immediately in larger batch quantities to capture greater volume discounts.',
            storeId: batch.storeId,
            batchId: batch.id,
          });
        }
      }
    });

    // General store-wide optimizations if no active batches
    if (storeBatches.length === 0) {
      recommendations.push({
        id: 'opt-empty-store',
        type: 'optimization',
        title: 'Add Initial Inventory Batches',
        description: 'You have not added any goods to this store yet.',
        impact: 'Go to the Inventory tab to record your first batch of stock and expenses.',
        storeId: state.activeStoreId,
      });
    }

    return recommendations;
  };

  return (
    <StoreContext.Provider
      value={{
        state,
        registerUser,
        loginUser,
        logoutUser,
        createStore,
        deleteStore,
        setActiveStore,
        addBatch,
        deleteBatch,
        recordSale,
        recordExpense,
        getStoreRecommendations,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
