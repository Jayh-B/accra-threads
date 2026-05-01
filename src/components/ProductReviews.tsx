'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import styles from './ProductReviews.module.css';

interface Review {
  id: string;
  rating: number;
  feedback: string;
  created_at: string;
  is_verified_purchase: boolean;
  customer: {
    full_name: string;
  };
  helpful_count: number;
}

interface RatingStats {
  avg_rating: number;
  total_reviews: number;
  rating_5: number;
  rating_4: number;
  rating_3: number;
  rating_2: number;
  rating_1: number;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  async function loadReviews() {
    const supabase = getSupabaseBrowserClient();

    // Load reviews
    const { data: reviewsData } = await supabase
      .from('customer_feedback')
      .select(`
        *,
        customer:profiles(full_name)
      `)
      .eq('product_id', productId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // Load rating stats
    const { data: statsData } = await supabase
      .rpc('get_product_rating', { p_product_id: productId });

    setReviews(reviewsData || []);
    setStats(statsData?.[0] || null);
    setLoading(false);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (loading) {
    return <div className={styles.loading}>Loading reviews...</div>;
  }

  if (!stats || stats.total_reviews === 0) {
    return (
      <div className={styles.empty}>
        <Star size={48} className={styles.emptyIcon} />
        <h3>No Reviews Yet</h3>
        <p>Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Rating Summary */}
      <div className={styles.summary}>
        <div className={styles.ratingBig}>
          <span className={styles.ratingNumber}>{stats.avg_rating.toFixed(1)}</span>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                fill={star <= Math.round(stats.avg_rating) ? '#f59e0b' : 'none'}
                color={star <= Math.round(stats.avg_rating) ? '#f59e0b' : '#d1d5db'}
              />
            ))}
          </div>
          <span className={styles.totalReviews}>{stats.total_reviews} reviews</span>
        </div>

        <div className={styles.breakdown}>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              rating === 5 ? stats.rating_5 :
              rating === 4 ? stats.rating_4 :
              rating === 3 ? stats.rating_3 :
              rating === 2 ? stats.rating_2 :
              stats.rating_1;
            const percentage = (count / stats.total_reviews) * 100;

            return (
              <div key={rating} className={styles.breakdownRow}>
                <span className={styles.breakdownLabel}>{rating} star</span>
                <div className={styles.breakdownBar}>
                  <div
                    className={styles.breakdownFill}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className={styles.breakdownCount}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewer}>
                <div className={styles.avatar}>
                  {review.customer?.full_name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className={styles.reviewerName}>
                    {review.customer?.full_name || 'Anonymous'}
                  </p>
                  <p className={styles.reviewDate}>{formatDate(review.created_at)}</p>
                </div>
              </div>
              {review.is_verified_purchase && (
                <span className={styles.verifiedBadge}>
                  <CheckCircle size={14} />
                  Verified Purchase
                </span>
              )}
            </div>

            <div className={styles.rating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill={star <= review.rating ? '#f59e0b' : 'none'}
                  color={star <= review.rating ? '#f59e0b' : '#d1d5db'}
                />
              ))}
            </div>

            <p className={styles.reviewText}>{review.feedback}</p>

            <div className={styles.reviewActions}>
              <button className={styles.helpfulBtn}>
                <ThumbsUp size={16} />
                Helpful ({review.helpful_count})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
