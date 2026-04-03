'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const tax = subtotal * 0.15;
  const delivery = subtotal > 0 ? 50 : 0;
  const total = subtotal + tax + delivery;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address
  const [useNewAddr, setUseNewAddr] = useState(false);

  // Payment
  const [payMethod, setPayMethod] = useState<'card' | 'momo'>('momo');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'voda' | 'airtel'>('mtn');

  if (items.length === 0 && step !== 3) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <h2>Your cart is empty.</h2>
          <Link href="/shop" className="btn btn-primary" style={{ marginTop: '24px' }}>Return to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.logoMarkX}>AT</Link>
        <span className={styles.secureBadge}><ShieldCheck size={16} /> Secure Checkout</span>
      </div>

      <div className={styles.layout}>
        {/* Left Side: Forms */}
        <div className={styles.main}>
          <div className="step-indicator">
            <div className={`step-item ${step > 1 ? 'complete' : ''} ${step === 1 ? 'active' : ''}`}>
              <div className="step-num">{step > 1 ? <Check size={14}/> : '1'}</div>
              <span className="step-label">Delivery</span>
            </div>
            <div className={`step-item ${step > 2 ? 'complete' : ''} ${step === 2 ? 'active' : ''}`}>
              <div className="step-num">{step > 2 ? <Check size={14}/> : '2'}</div>
              <span className="step-label">Payment</span>
            </div>
            <div className={`step-item ${step === 3 ? 'active' : ''}`}>
              <div className="step-num">3</div>
              <span className="step-label">Confirmation</span>
            </div>
          </div>

          {/* STEP 1: Address */}
          {step === 1 && (
            <div className={styles.stepBox}>
              <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Delivery Address</h2>
              
              <div className={styles.savedAddr}>
                <div className={styles.addrCard}>
                  <div className={styles.addrRadio}>
                    <input type="radio" id="a1" name="addr" checked={!useNewAddr} onChange={() => setUseNewAddr(false)} />
                  </div>
                  <label htmlFor="a1" className={styles.addrLabel}>
                    <strong>Home (Accra)</strong>
                    <p>Kofi Mensah</p>
                    <p>14 Oxford Street, Osu</p>
                    <p>Accra, Greater Accra</p>
                    <p>+233 24 123 4567</p>
                  </label>
                </div>
                
                <div className={`${styles.addrCard} ${useNewAddr ? styles.addrCardActive : ''}`}>
                  <div className={styles.addrRadio}>
                    <input type="radio" id="a2" name="addr" checked={useNewAddr} onChange={() => setUseNewAddr(true)} />
                  </div>
                  <label htmlFor="a2" className={styles.addrLabel}>
                    <strong>Deliver to different address</strong>
                  </label>
                </div>
              </div>

              {useNewAddr && (
                <div className={styles.newAddrForm}>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label className="input-label">First Name</label>
                      <input type="text" className="input-field" placeholder="Kofi" />
                    </div>
                    <div>
                      <label className="input-label">Last Name</label>
                      <input type="text" className="input-field" placeholder="Mensah" />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="input-label">Address</label>
                    <input type="text" className="input-field" placeholder="Street address or P.O Box" />
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label className="input-label">City</label>
                      <input type="text" className="input-field" placeholder="Accra" />
                    </div>
                    <div>
                      <label className="input-label">Region</label>
                      <select className="input-field input-select">
                        <option>Greater Accra</option>
                        <option>Ashanti Region</option>
                        <option>Northern Region</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Phone</label>
                    <input type="tel" className="input-field" placeholder="+233 XX XXX XXXX" />
                  </div>
                </div>
              )}

              <button className="btn btn-primary btn-lg" style={{ marginTop: '32px' }} onClick={() => setStep(2)}>
                Continue to Payment
              </button>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className={styles.stepBox}>
              <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Payment Method</h2>

              <div className={styles.payTabs}>
                <button 
                  className={`${styles.payTab} ${payMethod === 'momo' ? styles.payTabActive : ''}`}
                  onClick={() => setPayMethod('momo')}
                >
                  Mobile Money
                </button>
                <button 
                  className={`${styles.payTab} ${payMethod === 'card' ? styles.payTabActive : ''}`}
                  onClick={() => setPayMethod('card')}
                >
                  Paystack (Card)
                </button>
              </div>

              {payMethod === 'momo' && (
                <div className={styles.payBody}>
                  <p className="input-label" style={{ marginBottom: '12px' }}>Select Provider</p>
                  <div className={styles.momoGrid}>
                    <div className={`${styles.momoBox} ${momoProvider === 'mtn' ? styles.momoActive : ''}`} onClick={() => setMomoProvider('mtn')}>
                      <div className={styles.momoColor} style={{ background: '#FFCC00' }} />
                      <span>MTN MoMo</span>
                    </div>
                    <div className={`${styles.momoBox} ${momoProvider === 'voda' ? styles.momoActive : ''}`} onClick={() => setMomoProvider('voda')}>
                      <div className={styles.momoColor} style={{ background: '#E60000' }} />
                      <span>Telecel Cash</span>
                    </div>
                    <div className={`${styles.momoBox} ${momoProvider === 'airtel' ? styles.momoActive : ''}`} onClick={() => setMomoProvider('airtel')}>
                      <div className={styles.momoColor} style={{ background: '#FF0000' }} />
                      <span>AT Money</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <label className="input-label">Mobile Money Number</label>
                    <input type="tel" className="input-field" placeholder="024 XXX XXXX" />
                    <p className={styles.momoHint}>A prompt will be sent to your phone to authorize the payment.</p>
                  </div>
                </div>
              )}

              {payMethod === 'card' && (
                <div className={styles.payBody}>
                  <div className={styles.paystackPreview}>
                    <span className={styles.paystackLogo}>Paystack</span>
                    <p style={{ color: 'var(--color-text-3)', fontSize: '0.875rem' }}>You will be redirected to Paystack to complete your purchase securely.</p>
                  </div>
                </div>
              )}

              <div className={styles.payActions}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>
                  Pay GHS {total.toLocaleString()}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmation */}
          {step === 3 && (
            <div className={styles.stepBox} style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div className={styles.successIcon}>✓</div>
              <h2 className="font-display text-4xl" style={{ marginBottom: '16px' }}>Order Confirmed</h2>
              <p className="text-secondary" style={{ marginBottom: '8px' }}>Thank you for shopping with Accra Threads.</p>
              <p style={{ marginBottom: '32px' }}>Your order number is <strong className="font-mono text-primary">AT-2025-0043</strong></p>

              <div className={styles.earnBadge}>
                🐚 You earned <strong>+120 Cowrie Points</strong> on this order.
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '48px' }}>
                <Link href="/orders/AT-2025-0043/track" className="btn btn-primary">Track Order</Link>
                <Link href="/shop" className="btn btn-secondary">Continue Shopping</Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Order Summary */}
        <div className={styles.side}>
          <div className={styles.summaryCard}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>In your bag</h3>
            
            <div className={styles.sumItems}>
              {step < 3 ? items.map(item => (
                <div key={item.id+item.size} className={styles.sumItem}>
                  <div className={styles.sumImgWrap}>
                    <Image src={item.image} alt={item.name} fill className={styles.sumImg} />
                    <span className={styles.sumQtyBadge}>{item.qty}</span>
                  </div>
                  <div className={styles.sumItemInfo}>
                    <p className={styles.sumName}>{item.name}</p>
                    <p className={styles.sumVar}>{item.size}</p>
                  </div>
                  <div className={styles.sumItemPrice}>
                    GHS {(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              )) : (
                <div className={styles.sumItem}>
                  <div className={styles.sumItemInfo}>
                     <p className={styles.sumName}>Order items paid.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="divider" style={{ margin: '24px 0 16px' }} />

            <div className={styles.sumRow}>
              <span>Subtotal</span>
              <span className="font-mono">GHS {subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.sumRow}>
              <span>VAT (15%)</span>
              <span className="font-mono">GHS {tax.toLocaleString()}</span>
            </div>
            <div className={styles.sumRow}>
              <span>Delivery</span>
              <span className="font-mono">GHS {delivery.toLocaleString()}</span>
            </div>

            <div className="divider" style={{ margin: '16px 0' }} />

            <div className={`${styles.sumRow} ${styles.sumTotal}`}>
              <span>Total</span>
              <span className="font-mono text-primary">GHS {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
