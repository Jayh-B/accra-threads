'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { verifyPaymentAndSendConfirmation } from '@/lib/payment-actions';
import styles from './page.module.css';

function PaymentVerification() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const orderId = searchParams.get('order_id');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function verify() {
      if (!reference || !orderId) {
        setStatus('error');
        setError('Missing payment reference or order ID');
        return;
      }

      try {
        const result = await verifyPaymentAndSendConfirmation(orderId, reference);
        
        if (result.success) {
          setStatus('success');
          setOrderNumber(result.orderNumber || '');
        } else {
          setStatus('error');
          setError(result.error || 'Payment verification failed');
        }
      } catch (err) {
        setStatus('error');
        setError('An unexpected error occurred. Please contact support.');
      }
    }

    verify();
  }, [reference, orderId]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {status === 'loading' && (
          <div className={styles.loading}>
            <Loader2 size={48} className="spin" style={{ margin: '0 auto 24px' }} />
            <h2 className="font-display text-2xl">Verifying Payment...</h2>
            <p className="text-secondary">Please do not close this window.</p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.success}>
            <CheckCircle size={64} style={{ color: 'var(--color-accent-green)', margin: '0 auto 24px' }} />
            <h2 className="font-display text-3xl">Payment Successful!</h2>
            <p className="text-secondary" style={{ margin: '16px 0' }}>
              Thank you for your purchase. A confirmation email has been sent.
            </p>
            {orderNumber && (
              <p style={{ marginBottom: '32px' }}>
                Order Number: <strong className="font-mono">{orderNumber}</strong>
              </p>
            )}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <Link href={`/orders/${orderNumber}`} className="btn btn-primary">
                Track Order
              </Link>
              <Link href="/shop" className="btn btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.error}>
            <XCircle size={64} style={{ color: 'var(--color-accent-red)', margin: '0 auto 24px' }} />
            <h2 className="font-display text-3xl">Payment Failed</h2>
            <p className="text-secondary" style={{ margin: '16px 0' }}>
              {error || 'We could not verify your payment.'}
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
              <Link href="/checkout" className="btn btn-primary">
                Try Again
              </Link>
              <Link href="/support" className="btn btn-secondary">
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <Loader2 size={48} className="spin" style={{ margin: '0 auto 24px' }} />
            <h2 className="font-display text-2xl">Loading...</h2>
          </div>
        </div>
      </div>
    }>
      <PaymentVerification />
    </Suspense>
  );
}
