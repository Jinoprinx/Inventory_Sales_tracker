export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  batchId: string;
  quantitySold: number;
  salePricePerUnit: number;
  totalRevenue: number;
  dateSold: string;
}

export interface Expense {
  id: string;
  batchId: string;
  description: string;
  amount: number;
  dateIncurred: string;
}

export interface InventoryBatch {
  id: string;
  storeId: string;
  goodsName: string;
  category: string;
  quantityPurchased: number;
  quantitySold: number; // Cumulative quantity sold
  purchaseCostPerUnit: number;
  totalPurchaseCost: number;
  sellingPricePerUnit: number; // Default/standard target price
  dateBrought: string; // ISO date string
  completedAt: string | null; // Date when sold out
  sales: Sale[];
  expenses: Expense[];
}

export interface StoreState {
  users: User[];
  currentUser: User | null;
  stores: Store[];
  activeStoreId: string | null;
  batches: InventoryBatch[];
}
