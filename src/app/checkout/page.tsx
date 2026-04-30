'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Check, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrderWithPayment } from '@/lib/payment-actions';
import styles from './page.module.css';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, profile, isAuthenticated } = useAuth();
  const router = useRouter();
  const tax = subtotal * 0.15;
  const delivery = subtotal > 500 ? 0 : 50; // Free shipping over GHS 500
  const total = subtotal + tax + delivery;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Address form state
  const [useNewAddr, setUseNewAddr] = useState(false);
  const [firstName, setFirstName] = useState(profile?.full_name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(profile?.full_name?.split(' ').slice(1).join(' ') || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Accra');
  const [region, setRegion] = useState('Greater Accra');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // Payment
  const [payMethod, setPayMethod] = useState<'card' | 'momo'>('momo');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'voda' | 'airtel'>('mtn');
  const [momoNumber, setMomoNumber] = useState('');

  // Update email when user loads
  useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (profile?.full_name) {
      const parts = profile.full_name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    if (profile?.phone) setPhone(profile.phone);
  }, [user, profile]);

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

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const shippingAddress = useNewAddr ? {
        firstName,
        lastName,
        address,
        city,
        region,
        phone,
      } : {
        firstName: profile?.full_name?.split(' ')[0] || 'Kofi',
        lastName: profile?.full_name?.split(' ').slice(1).join(' ') || 'Mensah',
        address: '14 Oxford Street, Osu',
        city: 'Accra',
        region: 'Greater Accra',
        phone: profile?.phone || '+233 24 123 4567',
      };

      const result = await createOrderWithPayment({
        userId: user?.id || null,
        email,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          price: item.price,
          image: item.image,
          qty: item.qty,
          size: item.size,
          color: item.color,
        })),
        shippingAddress,
        paymentMethod: payMethod,
        momoProvider: payMethod === 'momo' ? momoProvider : undefined,
      });

      console.log('📦 Order result:', JSON.stringify(result, null, 2));
      alert('DEBUG: result.success=' + result.success + ', paymentUrl=' + (result.paymentUrl ? 'YES' : 'NO') + ', error=' + (result.error || 'none'));

      if (result.success && result.paymentUrl) {
        // Redirect to Paystack for payment
        console.log('✅ Order created, redirecting to Paystack:', result.paymentUrl);
        alert('Redirecting to: ' + result.paymentUrl.substring(0, 50) + '...');
        clearCart();
        // Use replace instead of href for cleaner history
        window.location.href = result.paymentUrl;
        return; // Stop execution here
      } else if (result.success) {
        // No payment URL - something went wrong
        console.error('❌ Success but no paymentUrl. Result:', result);
        alert('ERROR: Payment succeeded but no redirect URL. Check console.');
        setOrderNumber(result.orderNumber || '');
        clearCart();
        setStep(3);
      } else {
        console.error('❌ Order failed:', result.error);
        alert('ERROR: ' + (result.error || 'Failed to create order'));
        setError(result.error || 'Failed to create order. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Kofi" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="input-label">Last Name</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Mensah" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="input-label">Address</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Street address or P.O Box" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label className="input-label">City</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Accra" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="input-label">Region</label>
                      <select 
                        className="input-field input-select"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                      >
                        <option>Greater Accra</option>
                        <option>Ashanti Region</option>
                        <option>Northern Region</option>
                        <option>Western Region</option>
                        <option>Central Region</option>
                        <option>Eastern Region</option>
                        <option>Volta Region</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Phone</label>
                    <input 
                      type="tel" 
                      className="input-field" 
                      placeholder="+233 XX XXX XXXX" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <label className="input-label">Email</label>
                    <input 
                      type="email" 
                      className="input-field" 
                      placeholder="your@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
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
                    <input 
                      type="tel" 
                      className="input-field" 
                      placeholder="024 XXX XXXX" 
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                    />
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

              {error && (
                <div style={{ 
                  background: 'rgba(248, 113, 113, 0.1)', 
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  color: '#f87171'
                }}>
                  {error}
                </div>
              )}
              <div className={styles.payActions}>
                <button className="btn btn-ghost" onClick={() => setStep(1)} disabled={isProcessing}>Back</button>
                <button 
                  className="btn btn-primary btn-lg" 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                  ) : (
                    <>Pay GHS {total.toLocaleString()}</>
                  )}
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
              <p style={{ marginBottom: '32px' }}>Your order number is <strong className="font-mono text-primary">{orderNumber}</strong></p>

              <div className={styles.earnBadge}>
                🐚 You earned <strong>+{Math.floor(total / 10)} Cowrie Points</strong> on this order.
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '48px' }}>
                <Link href={`/orders/${orderNumber}/track`} className="btn btn-primary">Track Order</Link>
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
