'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  size: string;
  color: string;
  qty: number;
  image: string;
  slug: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string, color: string) => void;
  updateQty: (id: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems(prev => {
      const exists = prev.find(
        i => i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
      );
      if (exists) {
        return prev.map(i =>
          i.id === newItem.id && i.size === newItem.size && i.color === newItem.color
            ? { ...i, qty: i.qty + newItem.qty }
            : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((id: string, size: string, color: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size && i.color === color)));
  }, []);

  const updateQty = useCallback((id: string, size: string, color: string, qty: number) => {
    if (qty <= 0) { removeItem(id, size, color); return; }
    setItems(prev =>
      prev.map(i =>
        i.id === id && i.size === size && i.color === color ? { ...i, qty } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const subtotal   = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
