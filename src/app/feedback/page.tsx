'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Star, CheckCircle, Package, MessageSquare } from 'lucide-react';
import { submitFeedback } from '@/lib/crm-actions';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import styles from './page.module.css';

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Form state
  const [overallRating, setOverallRating] = useState(0);
  const [productRating, setProductRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push(`/login?redirect=/feedback?order=${orderId}`);
      return;
    }

    setCustomerId(session.user.id);

    if (orderId) {
      await loadOrderDetails(orderId, session.user.id);
    }

    setLoading(false);
  }

  async function loadOrderDetails(orderId: string, userId: string) {
    const supabase = getSupabaseBrowserClient();
    
    // Load order with items
    const { data: orderData } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*, product:products(*))
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderData) {
      setOrder(orderData);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || overallRating === 0) return;

    setSubmitting(true);

    try {
      // Submit overall experience feedback
      const result = await submitFeedback({
        customerId,
        orderId: orderId || undefined,
        rating: overallRating,
        feedback,
        category: 'general',
      });

      if (result.success) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <CheckCircle size={64} className={styles.successIcon} />
          <h1>Thank You for Your Feedback!</h1>
          <p>Your feedback helps us improve and helps other customers make informed decisions.</p>
          <div className={styles.rewardBox}>
            <h3>Your Reward</h3>
            <p>Use code <strong>THANKS10</strong> for 10% off your next purchase!</p>
          </div>
          <div className={styles.actions}>
            <button onClick={() => router.push('/shop')} className={styles.primaryBtn}>
              Continue Shopping
            </button>
            <button onClick={() => router.push('/account')} className={styles.secondaryBtn}>
              View My Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <MessageSquare size={32} className={styles.headerIcon} />
          <h1>How Was Your Experience?</h1>
          <p>We value your feedback and use it to improve our products and services.</p>
        </div>

        {order && (
          <div className={styles.orderInfo}>
            <div className={styles.orderHeader}>
              <Package size={20} />
              <span>Order {order.order_number}</span>
            </div>
            <div className={styles.orderItems}>
              {order.items?.map((item: any) => (
                <div key={item.id} className={styles.orderItem}>
                  <span>{item.product?.name || 'Product'}</span>
                  <span>x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Overall Rating */}
          <div className={styles.ratingSection}>
            <label>Overall Experience</label>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  className={styles.starBtn}
                >
                  <Star
                    size={32}
                    fill={star <= overallRating ? '#f59e0b' : 'none'}
                    color={star <= overallRating ? '#f59e0b' : '#d1d5db'}
                  />
                </button>
              ))}
            </div>
            <span className={styles.ratingLabel}>
              {overallRating === 1 && 'Poor'}
              {overallRating === 2 && 'Fair'}
              {overallRating === 3 && 'Good'}
              {overallRating === 4 && 'Very Good'}
              {overallRating === 5 && 'Excellent'}
            </span>
          </div>

          {/* Product Rating */}
          <div className={styles.ratingSection}>
            <label>Product Quality</label>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setProductRating(star)}
                  className={styles.starBtn}
                >
                  <Star
                    size={24}
                    fill={star <= productRating ? '#f59e0b' : 'none'}
                    color={star <= productRating ? '#f59e0b' : '#d1d5db'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Rating */}
          <div className={styles.ratingSection}>
            <label>Delivery Experience</label>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setDeliveryRating(star)}
                  className={styles.starBtn}
                >
                  <Star
                    size={24}
                    fill={star <= deliveryRating ? '#f59e0b' : 'none'}
                    color={star <= deliveryRating ? '#f59e0b' : '#d1d5db'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Would Recommend */}
          <div className={styles.recommendSection}>
            <label>Would you recommend Accra Threads to a friend?</label>
            <div className={styles.recommendButtons}>
              <button
                type="button"
                onClick={() => setWouldRecommend(true)}
                className={wouldRecommend === true ? styles.active : ''}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWouldRecommend(false)}
                className={wouldRecommend === false ? styles.active : ''}
              >
                No
              </button>
            </div>
          </div>

          {/* Written Feedback */}
          <div className={styles.feedbackSection}>
            <label>Tell us more about your experience (optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did you like? What could we improve?"
              rows={4}
              className={styles.textarea}
            />
          </div>

          {/* Anonymous Option */}
          <div className={styles.anonymousSection}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <span>Submit anonymously</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={overallRating === 0 || submitting}
            className={styles.submitBtn}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
