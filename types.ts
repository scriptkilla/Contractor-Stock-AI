
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  locations?: string[]; // Changed from single location string to array
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
  DASHBOARD = 'dashboard',
  SCAN = 'scan',
  INVENTORY = 'inventory',
  ADD_PRODUCT = 'add_product',
  SETTINGS = 'settings',
  TEAMS = 'teams'
}
