'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Loader2, Upload } from 'lucide-react';
import { createProduct, generateSlug } from '@/lib/product-actions';
import styles from '../../page.module.css';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('clothing');
  const [gender, setGender] = useState<'men' | 'women' | 'unisex'>('unisex');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  
  // Colors
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  
  // Sizes
  const [sizes, setSizes] = useState<{ label: string; stock: number }[]>([]);
  const [newSizeLabel, setNewSizeLabel] = useState('');
  const [newSizeStock, setNewSizeStock] = useState(10);
  
  // Images (mock - in real app would upload to storage)
  const [images, setImages] = useState<string[]>([]);
  
  const handleGenerateSlug = async () => {
    if (!name) return;
    const generated = await generateSlug(name);
    setSlug(generated);
  };
  
  const handleAddColor = () => {
    if (!newColorName) return;
    setColors([...colors, { name: newColorName, hex: newColorHex }]);
    setNewColorName('');
    setNewColorHex('#000000');
  };
  
  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };
  
  const handleAddSize = () => {
    if (!newSizeLabel) return;
    setSizes([...sizes, { label: newSizeLabel, stock: newSizeStock }]);
    setNewSizeLabel('');
    setNewSizeStock(10);
  };
  
  const handleRemoveSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const result = await createProduct({
      name,
      slug,
      sku: sku || `SKU-${Date.now()}`,
      category,
      gender,
      price: parseFloat(price) || 0,
      sale_price: salePrice ? parseFloat(salePrice) : null,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      colors: colors.length > 0 ? colors : [{ name: 'Default', hex: '#1a1a1a' }],
      sizes: sizes.length > 0 ? sizes : [{ label: 'M', stock: 10 }],
      featured,
      published,
      images: images.length > 0 ? images : ['/products/placeholder.jpg'],
    });
    
    if (result.success) {
      router.push('/admin/products');
    } else {
      setError(result.error || 'Failed to create product');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/admin/products" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className={styles.pageTitle}>Add New Product</h1>
            <p className={styles.pageSubtitle}>Create a new product in your catalog</p>
          </div>
        </div>
      </div>
      
      {error && (
        <div style={{ 
          background: 'rgba(248, 113, 113, 0.1)', 
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
          color: '#f87171'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.section}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Left Column - Basic Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Basic Information</h3>
            
            <div>
              <label className="input-label">Product Name *</label>
              <input 
                type="text" 
                className="input-field" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleGenerateSlug}
                required
              />
            </div>
            
            <div>
              <label className="input-label">Slug *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
                <button type="button" className="btn btn-secondary" onClick={handleGenerateSlug}>
                  Generate
                </button>
              </div>
            </div>
            
            <div>
              <label className="input-label">SKU</label>
              <input 
                type="text" 
                className="input-field" 
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Auto-generated if empty"
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="input-label">Category</label>
                <select 
                  className="input-field input-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="clothing">Clothing</option>
                  <option value="accessories">Accessories</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="bags">Bags</option>
                  <option value="hats">Hats</option>
                  <option value="jackets">Jackets</option>
                  <option value="outerwear">Outerwear</option>
                </select>
              </div>
              <div>
                <label className="input-label">Gender</label>
                <select 
                  className="input-field input-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="input-label">Price (GHS) *</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="input-label">Sale Price (GHS)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                />
              </div>
            </div>
            
            <div>
              <label className="input-label">Description</label>
              <textarea 
                className="input-field" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <div>
              <label className="input-label">Tags (comma-separated)</label>
              <input 
                type="text" 
                className="input-field" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="kente, handmade, new-arrival"
              />
            </div>
            
            <div style={{ display: 'flex', gap: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                Featured Product
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                Published
              </label>
            </div>
          </div>
          
          {/* Right Column - Variants */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Variants</h3>
            
            {/* Colors */}
            <div>
              <label className="input-label">Colors</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Color name"
                  style={{ flex: 1 }}
                />
                <input 
                  type="color" 
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  style={{ width: 50, height: 36, padding: 2, cursor: 'pointer' }}
                />
                <button type="button" className="btn btn-secondary" onClick={handleAddColor}>
                  <Plus size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {colors.map((color, i) => (
                  <div 
                    key={i}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6, 
                      padding: '4px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ width: 16, height: 16, background: color.hex, borderRadius: 2 }} />
                    <span style={{ fontSize: '0.875rem' }}>{color.name}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveColor(i)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sizes */}
            <div>
              <label className="input-label">Sizes & Stock</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newSizeLabel}
                  onChange={(e) => setNewSizeLabel(e.target.value)}
                  placeholder="Size (S, M, L, XL)"
                  style={{ flex: 1 }}
                />
                <input 
                  type="number" 
                  className="input-field" 
                  value={newSizeStock}
                  onChange={(e) => setNewSizeStock(parseInt(e.target.value) || 0)}
                  min="0"
                  style={{ width: 80 }}
                />
                <button type="button" className="btn btn-secondary" onClick={handleAddSize}>
                  <Plus size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sizes.map((size, i) => (
                  <div 
                    key={i}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 4,
                    }}
                  >
                    <span>{size.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: 'var(--color-text-3)', fontSize: '0.875rem' }}>
                        Stock: {size.stock}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveSize(i)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Images Placeholder */}
            <div>
              <label className="input-label">Images</label>
              <div style={{ 
                padding: 24, 
                border: '2px dashed rgba(255,255,255,0.1)',
                borderRadius: 8,
                textAlign: 'center',
                color: 'var(--color-text-3)'
              }}>
                <Upload size={32} style={{ marginBottom: 8 }} />
                <p>Image upload requires Supabase Storage setup</p>
                <p style={{ fontSize: '0.75rem', marginTop: 4 }}>Use Supabase dashboard for now</p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/admin/products" className="btn btn-ghost">
            Cancel
          </Link>
          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="spin" /> Creating...</>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
