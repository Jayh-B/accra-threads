'use client';
import { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star, Minus, Plus, Heart, ChevronRight } from 'lucide-react';
import { getProduct, getRelated } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ui/ProductCard';
import styles from './page.module.css';

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  const related = getRelated(product);
  const { addItem } = useCart();
  const { toggle, isWished } = useWishlist();
  
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name);
  const [qty, setQty] = useState(1);
  const [shakeErr, setShakeErr] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!selectedSize) {
      setShakeErr(true);
      setTimeout(() => setShakeErr(false), 400);
      return;
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: activeImage,
      size: selectedSize,
      color: selectedColor,
      qty,
      slug: product.slug,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <a href="/">Home</a> <ChevronRight size={12} />
        <a href="/shop">Shop</a> <ChevronRight size={12} />
        <span>{product.name}</span>
      </div>

      <div className={styles.productLayout}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.thumbnails}>
            {product.images.map(img => (
              <button 
                key={img} 
                className={`${styles.thumbBtn} ${activeImage === img ? styles.thumbActive : ''}`}
                onClick={() => setActiveImage(img)}
              >
                <Image src={img} alt="thumb" fill className={styles.thumbImg} />
              </button>
            ))}
          </div>
          <div className={styles.mainImageWrap}>
            <Image src={activeImage} alt={product.name} fill priority className={styles.mainImg} />
          </div>
        </div>

        {/* Info Panel */}
        <div className={styles.info}>
          <div className={styles.headerRow}>
            <h1 className="font-display text-3xl">{product.name}</h1>
            <span className={styles.sku}>SKU: {product.id.toUpperCase()}</span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>GHS {product.price.toLocaleString()}</span>
            {product.originalPrice && <span className={styles.priceOld}>GHS {product.originalPrice.toLocaleString()}</span>}
            {product.isSale && <span className="badge badge-sale">Sale</span>}
          </div>

          <div className="divider" style={{ margin: '24px 0' }} />

          {/* Color Picker */}
          <div className={styles.optionGroup}>
            <div className={styles.optionHeader}>
              <span className={styles.optionLabel}>Color</span>
              <span className={styles.optionValue}>{selectedColor}</span>
            </div>
            <div className={styles.colorWrap}>
              {product.colors.map(c => (
                <button
                  key={c.name}
                  className={`${styles.colorChip} ${selectedColor === c.name ? styles.colorActive : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setSelectedColor(c.name)}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className={styles.optionGroup}>
            <div className={styles.optionHeader}>
              <span className={styles.optionLabel}>Size</span>
              <button className={styles.sizeGuideBtn}>Size Guide</button>
            </div>
            <div className={`pill-group ${shakeErr ? 'shake' : ''}`}>
              {product.sizes.map(s => {
                const isOut = s.stock === 0;
                const isLow = s.stock > 0 && s.stock < 5;
                const isSel = selectedSize === s.label;
                return (
                  <button
                    key={s.label}
                    className={`pill ${isOut ? 'disabled' : ''} ${isSel ? 'selected' : ''} ${isLow && !isSel ? 'low' : ''}`}
                    disabled={isOut}
                    onClick={() => setSelectedSize(s.label)}
                  >
                    {s.label} {isLow && <span className={styles.pillNote}>Only {s.stock} left</span>}
                  </button>
                );
              })}
            </div>
            {shakeErr && <p className="input-error-msg">Please select a size to continue</p>}
          </div>

          {/* Quantity */}
          <div className={styles.optionGroup}>
            <span className={styles.optionLabel} style={{ marginBottom: '8px', display: 'block' }}>Quantity</span>
            <div className="qty-stepper" style={{ display: 'inline-flex' }}>
              <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
              <div className="qty-value">{qty}</div>
              <button className="qty-btn" onClick={() => setQty(qty + 1)}><Plus size={14} /></button>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={`btn btn-lg ${added ? 'btn-secondary' : 'btn-primary'}`} style={{ flex: 1 }} onClick={handleAdd}>
              {added ? 'Added to Cart ✓' : 'Add to Cart'}
            </button>
            <button className={`btn btn-secondary btn-lg ${styles.wishBtn}`} onClick={() => toggle({ id: product.id, name: product.name, price: product.price, image: product.images[0], slug: product.slug })}>
              <Heart size={20} fill={isWished(product.id) ? 'currentColor' : 'none'} color={isWished(product.id) ? 'var(--color-primary)' : 'currentColor'} />
            </button>
          </div>

          {/* Points */}
          <div className={styles.pointsEarn}>
            <span className={styles.pointIcon}>🐚</span>
            <span>Earn <strong>{product.cowriePoints} Cowrie Points</strong> with this purchase</span>
          </div>

          <div className="divider" />

          {/* Description */}
          <div className={styles.descBlock}>
            <p className={styles.descText}>{product.description}</p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className={`section ${styles.related}`}>
          <h2 className="font-display text-2xl" style={{ marginBottom: '32px' }}>Complete The Look</h2>
          <div className={styles.relatedGrid}>
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
