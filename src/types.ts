/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: string;
  salesCount: number; // For admin analytics simulation
  rating?: number;
  vendeur?: string;
  vendeurSlug?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    priceAtSale: number;
  }[];
  totalAmount: number;
}
