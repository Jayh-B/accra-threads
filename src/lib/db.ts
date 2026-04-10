// Supabase server client for data fetches
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest } from 'next/server';

const createClientServer = () => createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return undefined;
      },
      set(name: string, value: string, options: CookieOptions) {},
      remove(name: string, options: CookieOptions) {},
    },
  }
);

export const db = createClientServer();

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  gender: string;
  price: number;
  sale_price: number | null;
  description: string;
  tags: string[];
  images: string[];
  colors?: any[]; // JSONB
  sizes?: any[]; // JSONB
  featured: boolean;
  published: boolean;
  created_at: string;
}

// Forward Product type (will import from data.ts later)
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  category: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isSale?: boolean;
  cowriePoints: number;
  colors: { name: string; hex: string }[];
  sizes: { label: string; stock: number }[];
}

export const toProduct = (db: DbProduct): Product => ({
  id: db.id || db.slug,
  name: db.name,
  slug: db.slug,
  price: db.price / 100,
  originalPrice: db.sale_price ? db.sale_price / 100 : undefined,
  images: db.images || [],
  description: db.description,
  category: db.category as 'men' | 'women' | 'accessories' | 'kente drops',
  rating: 4.6 + (Math.random() * 0.3),
  reviewCount: Math.floor(20 + Math.random() * 180),
  isNew: db.tags?.includes('new'),
  isSale: !!db.sale_price,
  cowriePoints: Math.floor((db.price / 100) / 10),
  colors: db.colors?.length ? db.colors : [{ name: 'Default', hex: '#1a1a1a' }],
  sizes: db.sizes?.length ? db.sizes.map((s: any) => ({ label: s.label || s.size, stock: s.stock || 10 })) : [{ label: 'M', stock: 10 }]
});
