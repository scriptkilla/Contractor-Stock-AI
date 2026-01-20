
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  locations?: string[];
  quantity: number;
  price: number;
  imageUrl?: string;
  lastUpdated: string;
}

export type ScanResult = {
  barcode: string;
  timestamp: number;
};

export enum View {
  AUTH = 'auth',
  DASHBOARD = 'dashboard',
  SCAN = 'scan',
  INVENTORY = 'inventory',
  ADD_PRODUCT = 'add_product',
  SETTINGS = 'settings',
  TEAMS = 'teams'
}
