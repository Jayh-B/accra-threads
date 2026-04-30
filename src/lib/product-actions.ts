/**
 * product-actions.ts - Server Actions for Product Management
 * Full CRUD operations for products
 */

'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export type ProductInput = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  gender: 'men' | 'women' | 'unisex';
  price: number; // in GHS
  sale_price?: number | null;
  description: string;
  tags: string[];
  colors: { name: string; hex: string }[];
  sizes: { label: string; stock: number }[];
  featured: boolean;
  published: boolean;
  images: string[];
};

/**
 * Create a new product
 */
export async function createProduct(input: ProductInput): Promise<{ success: boolean; productId?: string; error?: string }> {
  const db = getAdminClient();
  
  try {
    // Check if slug already exists
    const { data: existing } = await db
      .from('products')
      .select('id')
      .eq('slug', input.slug)
      .single();
    
    if (existing) {
      return { success: false, error: 'A product with this slug already exists' };
    }
    
    const productId = crypto.randomUUID();
    
    // Create product
    const { data: product, error: productError } = await db
      .from('products')
      .insert({
        id: productId,
        name: input.name,
        slug: input.slug,
        sku: input.sku,
        category: input.category,
        gender: input.gender,
        price: Math.round(input.price * 100), // Convert to pesewas
        sale_price: input.sale_price ? Math.round(input.sale_price * 100) : null,
        description: input.description,
        tags: input.tags,
        colors: input.colors,
        sizes: input.sizes,
        featured: input.featured,
        published: input.published,
        images: input.images,
      })
      .select()
      .single();
    
    if (productError) throw productError;
    
    // Create initial inventory record if published
    if (input.published) {
      const totalStock = input.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
      
      await db.from('inventory').insert({
        product_id: productId,
        location_type: 'warehouse',
        quantity: totalStock,
        reserved_quantity: 0,
        reorder_point: 10,
        reorder_quantity: 50,
      });
    }
    
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    
    return { success: true, productId: product.id };
    
  } catch (error) {
    console.error('Product creation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create product' 
    };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  productId: string, 
  input: Partial<ProductInput>
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminClient();
  
  try {
    const updates: any = {};
    
    if (input.name !== undefined) updates.name = input.name;
    if (input.slug !== undefined) updates.slug = input.slug;
    if (input.sku !== undefined) updates.sku = input.sku;
    if (input.category !== undefined) updates.category = input.category;
    if (input.gender !== undefined) updates.gender = input.gender;
    if (input.price !== undefined) updates.price = Math.round(input.price * 100);
    if (input.sale_price !== undefined) updates.sale_price = input.sale_price ? Math.round(input.sale_price * 100) : null;
    if (input.description !== undefined) updates.description = input.description;
    if (input.tags !== undefined) updates.tags = input.tags;
    if (input.colors !== undefined) updates.colors = input.colors;
    if (input.sizes !== undefined) updates.sizes = input.sizes;
    if (input.featured !== undefined) updates.featured = input.featured;
    if (input.published !== undefined) updates.published = input.published;
    if (input.images !== undefined) updates.images = input.images;
    
    updates.updated_at = new Date().toISOString();
    
    const { error } = await db
      .from('products')
      .update(updates)
      .eq('id', productId);
    
    if (error) throw error;
    
    // Update inventory if sizes changed
    if (input.sizes && input.published !== false) {
      const totalStock = input.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
      
      // Check if inventory exists
      const { data: existingInv } = await db
        .from('inventory')
        .select('id')
        .eq('product_id', productId)
        .eq('location_type', 'warehouse')
        .single();
      
      if (existingInv) {
        await db
          .from('inventory')
          .update({ quantity: totalStock })
          .eq('id', existingInv.id);
      } else {
        await db.from('inventory').insert({
          product_id: productId,
          location_type: 'warehouse',
          quantity: totalStock,
          reserved_quantity: 0,
          reorder_point: 10,
          reorder_quantity: 50,
        });
      }
    }
    
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath(`/shop/${input.slug || ''}`);
    
    return { success: true };
    
  } catch (error) {
    console.error('Product update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update product' 
    };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  const db = getAdminClient();
  
  try {
    // Check if product has orders
    const { data: orderItems } = await db
      .from('order_items')
      .select('id')
      .eq('product_id', productId)
      .limit(1);
    
    if (orderItems && orderItems.length > 0) {
      return { 
        success: false, 
        error: 'Cannot delete product with existing orders. Unpublish instead.' 
      };
    }
    
    // Delete inventory records
    await db.from('inventory').delete().eq('product_id', productId);
    
    // Delete marketplace listings
    await db.from('marketplace_listings').delete().eq('product_id', productId);
    
    // Delete supplier product links
    await db.from('supplier_products').delete().eq('product_id', productId);
    
    // Delete product
    const { error } = await db.from('products').delete().eq('id', productId);
    
    if (error) throw error;
    
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    
    return { success: true };
    
  } catch (error) {
    console.error('Product deletion error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete product' 
    };
  }
}

/**
 * Generate a unique slug from product name
 */
export async function generateSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const db = getAdminClient();
  
  // Check if base slug exists
  const { data: existing } = await db
    .from('products')
    .select('slug')
    .ilike('slug', `${base}%`);
  
  if (!existing || existing.length === 0) {
    return base;
  }
  
  // Find a unique suffix
  const existingSlugs = new Set(existing.map(p => p.slug));
  let counter = 1;
  let newSlug = `${base}-${counter}`;
  
  while (existingSlugs.has(newSlug)) {
    counter++;
    newSlug = `${base}-${counter}`;
  }
  
  return newSlug;
}

/**
 * Duplicate a product
 */
export async function duplicateProduct(productId: string): Promise<{ success: boolean; newProductId?: string; error?: string }> {
  const db = getAdminClient();
  
  try {
    // Get original product
    const { data: original, error: fetchError } = await db
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (fetchError || !original) {
      return { success: false, error: 'Product not found' };
    }
    
    // Generate new slug
    const newSlug = await generateSlug(`${original.name} copy`);
    const newSku = `${original.sku}-COPY-${Date.now().toString().slice(-4)}`;
    
    // Create copy
    const { data: newProduct, error: createError } = await db
      .from('products')
      .insert({
        ...original,
        id: crypto.randomUUID(),
        name: `${original.name} (Copy)`,
        slug: newSlug,
        sku: newSku,
        published: false,
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    revalidatePath('/admin/products');
    
    return { success: true, newProductId: newProduct.id };
    
  } catch (error) {
    console.error('Product duplication error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to duplicate product' 
    };
  }
}

/**
 * Bulk update product status
 */
export async function bulkUpdateProducts(
  productIds: string[],
  updates: { published?: boolean; featured?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminClient();
  
  try {
    const { error } = await db
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', productIds);
    
    if (error) throw error;
    
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    
    return { success: true };
    
  } catch (error) {
    console.error('Bulk update error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update products' 
    };
  }
}
