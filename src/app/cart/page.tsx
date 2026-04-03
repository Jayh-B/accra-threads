'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const tax = subtotal * 0.15; // 15% VAT
  const delivery = subtotal > 0 ? 50 : 0; // Flat GHS 50 delivery
  const total = subtotal + tax + delivery;

  if (items.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <div className={styles.emptyIcon}>🛒</div>
        <h1 className="font-display text-4xl" style={{ marginBottom: '16px' }}>Your cart is empty</h1>
        <p className="text-secondary" style={{ marginBottom: '32px' }}>Looks like you haven&apos;t added any pieces to your cart yet.</p>
        <Link href="/shop" className="btn btn-primary btn-lg">Explore New Arrivals</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className="section-title">Your Cart</h1>
      
      <div className={styles.layout}>
        <div className={styles.list}>
          <div className={styles.listHeader}>
            <span>Product</span>
            <div className={styles.colRight}>
              <span>Quantity</span>
              <span>Total</span>
            </div>
          </div>
          
          <div className={styles.items}>
            {items.map(item => (
              <div key={`${item.id}-${item.size}-${item.color}`} className={styles.item}>
                <div className={styles.itemMain}>
                  <Link href={`/shop/${item.slug}`} className={styles.itemImgWrap}>
                    <Image src={item.image} alt={item.name} fill className={styles.itemImg} />
                  </Link>
                  <div className={styles.itemInfo}>
                    <Link href={`/shop/${item.slug}`} className={styles.itemName}>{item.name}</Link>
                    <p className={styles.itemVariant}>{item.color} | Size: {item.size}</p>
                    <p className={styles.itemPriceMobile}>GHS {item.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className={styles.itemRight}>
                  <div className={styles.itemQty}>
                    <div className="qty-stepper">
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.size, item.color, item.qty - 1)}><Minus size={12} /></button>
                      <div className="qty-value">{item.qty}</div>
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.size, item.color, item.qty + 1)}><Plus size={12} /></button>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.id, item.size, item.color)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  
                  <div className={styles.itemTotal}>
                    GHS {(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.summaryWrap}>
          <div className={styles.summary}>
            <h2 className={styles.sumTitle}>Order Summary</h2>
            
            <div className={styles.sumRow}>
              <span className={styles.sumLabel}>Subtotal</span>
              <span className={styles.sumValue}>GHS {subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.sumRow}>
              <span className={styles.sumLabel}>VAT (15%)</span>
              <span className={styles.sumValue}>GHS {tax.toLocaleString()}</span>
            </div>
            <div className={styles.sumRow}>
              <span className={styles.sumLabel}>Delivery (Accra)</span>
              <span className={styles.sumValue}>GHS {delivery.toLocaleString()}</span>
            </div>

            <div className="divider" style={{ margin: '20px 0' }} />

            <div className={`${styles.sumRow} ${styles.sumTotalRow}`}>
              <span>Total</span>
              <span className={styles.sumTotalValue}>GHS {total.toLocaleString()}</span>
            </div>

            <div className={styles.promoWrap}>
              <p className={styles.promoLabel}>Use Cowrie Points</p>
              <div className={styles.promoInputWrap}>
                <input type="text" placeholder="Enter amount" className="input-field" />
                <button className="btn btn-secondary">Apply</button>
              </div>
              <p className={styles.promoHint}>Available balance: 120 Points</p>
            </div>

            <Link href="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '24px' }}>
              Proceed to Checkout <ArrowRight size={16} />
            </Link>

            <div className={styles.secureWrap}>
              <span>🔒 Secure Checkout via Paystack & MoMo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
