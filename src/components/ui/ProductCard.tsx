'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/lib/data';
import styles from './ProductCard.module.css';

interface Props {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority }: Props) {
  const { toggle, isWished } = useWishlist();
  const { addItem, totalItems } = useCart();
  const wished = isWished(product.id);

  return (
    <div className={`product-card ${styles.card}`}>
      <Link href={`/shop/${product.slug}`} className={styles.imageWrap}>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw, 25vw"
          className={`product-card__img product-card__img--primary ${styles.img}`}
          priority={priority}
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={product.name + ' alternate'}
            fill
            sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw, 25vw"
            className={`product-card__img product-card__img--alt ${styles.img}`}
          />
        )}
        <div className="product-card__badges">
          {product.isNew  && <span className="badge badge-new">New</span>}
          {product.isSale && <span className="badge badge-sale">Sale</span>}
          {product.sizes.every(s => s.stock === 0) && <span className="badge badge-sold">Sold Out</span>}
          {!product.sizes.every(s => s.stock === 0) && product.sizes.some(s => s.stock > 0 && s.stock < 5) && !product.isSale && !product.isNew &&
            <span className="badge badge-low">Low Stock</span>}
        </div>
        <button
          className={`product-card__wish ${wished ? 'active' : ''}`}
          onClick={e => { e.preventDefault(); toggle({ id: product.id, name: product.name, price: product.price, image: product.images[0], slug: product.slug }); }}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={15} fill={wished ? 'currentColor' : 'none'} strokeWidth={wished ? 2 : 1.5} />
        </button>
        <div className="product-card__actions">
          <button className="btn product-card__quick-view">Quick View</button>
          {product.sizes.some(s => s.stock > 0) && (
            <button 
              className="btn product-card__add-cart"
              onClick={e => {
                e.preventDefault();
                const defaultSize = product.sizes.find(s => s.stock > 0);
                if (defaultSize) {
                  addItem({ id: product.id, name: product.name, price: product.price, originalPrice: product.originalPrice, image: product.images[0], size: defaultSize.label, color: '', qty: 1, slug: product.slug });
                }
              }}
            >
              Add to Bag
            </button>
          )}
        </div>
      </Link>
      <div className="product-card__info">
        <p className="product-card__name">{product.name}</p>
        <div className="product-card__price-row">
          <span className="product-card__price">GHS {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="product-card__price-original">GHS {product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        <div className={styles.meta}>
          <span className={styles.rating}>★ {product.rating}</span>
          <span className={styles.reviews}>({product.reviewCount})</span>
        </div>
      </div>
    </div>
  );
}
