
import { Product } from '../types';

const DB_KEY = 'scanventory_db';

export const db = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  getProductBySku: (sku: string): Product | undefined => {
    const products = db.getProducts();
    return products.find(p => p.sku === sku);
  },

  saveProduct: (product: Product): void => {
    const products = db.getProducts();
    const index = products.findIndex(p => p.sku === product.sku);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(products));
  },

  deleteProduct: (id: string): void => {
    const products = db.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
  }
};
