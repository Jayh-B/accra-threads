'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  isWished: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const toggle = useCallback((item: WishlistItem) => {
    setItems(prev =>
      prev.find(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]
    );
  }, []);

  const isWished = useCallback((id: string) => items.some(i => i.id === id), [items]);

  return (
    <WishlistContext.Provider value={{ items, toggle, isWished, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
