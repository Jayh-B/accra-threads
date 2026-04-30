import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';
import { fetchOrderByNumber } from '@/lib/order-data';
import styles from './page.module.css';

interface OrderTrackPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number, currency: string = 'GHS'): string {
  return `${currency} ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
}

export default async function OrderTrackPage({ params }: OrderTrackPageProps) {
  const { id } = await params;
  const order = await fetchOrderByNumber(id);
  
  if (!order) {
    notFound();
  }

  // Map order status to tracking progress
  const statusMap: Record<string, number> = {
    'pending': 0,
    'confirmed': 0,
    'processing': 0,
    'shipped': 1,
    'in_transit': 2,
    'out_for_delivery': 2,
    'delivered': 3,
    'cancelled': -1,
    'returned': -1,
  };
  
  const deliveryStatus = order.delivery?.status || order.status;
  const curIdx = statusMap[deliveryStatus] ?? 0;
  const progressPercent = curIdx >= 0 ? (curIdx / 3) * 100 : 0;
  const isDelivered = deliveryStatus === 'delivered';
  const isCancelled = deliveryStatus === 'cancelled' || order.status === 'cancelled';

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/account?tab=orders">Account</Link> <ChevronRight size={14}/>
        <Link href="/account?tab=orders">Orders</Link> <ChevronRight size={14}/>
        <span>{order.order_number}</span>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className="font-display text-3xl">Order Details</h1>
          <p className="text-secondary mt-2">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div>
          {isDelivered ? (
            <span className="badge badge-cowrie text-sm px-4 py-2">Delivered</span>
          ) : isCancelled ? (
            <span className="badge badge-error text-sm px-4 py-2">Cancelled</span>
          ) : (
            <span className="badge badge-primary text-sm px-4 py-2">{order.status.replace('_', ' ')}</span>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left: Tracker */}
        <div className={styles.main}>
          <div className={styles.statusBox}>
            <h3 className="text-lg mb-4">Order Status</h3>
            
            {!isCancelled ? (
              <div className={styles.progressWrap}>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
                </div>
                
                <div className={styles.nodes}>
                  {/* Confirmed */}
                  <div className={`${styles.node} ${curIdx >= 0 ? styles.nodeDone : ''}`}>
                    <div className={styles.iconWrap}><Package size={20} /></div>
                    <div className={styles.nodeLabels}>
                      <p className={styles.nodeTitle}>Order Confirmed</p>
                      <p className={styles.nodeTime}>{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {/* Shipped */}
                  <div className={`${styles.node} ${curIdx >= 1 ? styles.nodeDone : ''}`}>
                    <div className={styles.iconWrap}><Truck size={20} /></div>
                    <div className={styles.nodeLabels}>
                      <p className={styles.nodeTitle}>Shipped</p>
                      {curIdx >= 1 && <p className={styles.nodeTime}>Package has left facility</p>}
                    </div>
                  </div>

                  {/* Out for Delivery */}
                  <div className={`${styles.node} ${curIdx >= 2 ? styles.nodeDone : ''}`}>
                    <div className={styles.iconWrap}><Truck size={20} /></div>
                    <div className={styles.nodeLabels}>
                      <p className={styles.nodeTitle}>Out for Delivery</p>
                      {curIdx >= 2 && <p className={styles.nodeTime}>Rider is on the way</p>}
                    </div>
                  </div>

                  {/* Delivered */}
                  <div className={`${styles.node} ${curIdx >= 3 ? styles.nodeDone : ''}`}>
                    <div className={styles.iconWrap}><CheckCircle2 size={20} /></div>
                    <div className={styles.nodeLabels}>
                      <p className={styles.nodeTitle}>Delivered</p>
                      {order.delivery?.actual_delivery && (
                        <p className={styles.nodeTime}>{formatDate(order.delivery.actual_delivery)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ 
                padding: 24, 
                background: 'rgba(248, 113, 113, 0.1)', 
                borderRadius: 8,
                textAlign: 'center'
              }}>
                <p style={{ color: '#f87171' }}>This order has been cancelled.</p>
                <p className="text-secondary text-sm mt-2">
                  If you have questions, please contact support.
                </p>
              </div>
            )}
            
            {/* Tracking Info */}
            {order.delivery?.tracking_number && (
              <div className={styles.trackingInfo} style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <h4 className="text-md mb-3">Tracking Information</h4>
                <div style={{ display: 'grid', gap: 8 }}>
                  {order.delivery.carrier && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-secondary">Carrier</span>
                      <span>{order.delivery.carrier}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Tracking Number</span>
                    <span style={{ fontFamily: 'monospace' }}>{order.delivery.tracking_number}</span>
                  </div>
                  {order.delivery.tracking_url && (
                    <div style={{ marginTop: 8 }}>
                      <a 
                        href={order.delivery.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                      >
                        Track on {order.delivery.carrier || 'Carrier'} Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Delivery Address */}
            <div className={styles.deliveryDetails} style={{ marginTop: 24 }}>
              <h3 className="text-lg mb-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={18} /> Delivery Address
              </h3>
              <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <p className="font-medium">
                  {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                </p>
                <p className="text-secondary text-sm mt-1">
                  {order.shipping_address?.address}
                </p>
                <p className="text-secondary text-sm">
                  {order.shipping_address?.city}, {order.shipping_address?.region}
                </p>
                <p className="text-secondary text-sm mt-2">
                  {order.shipping_address?.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className={styles.side}>
          <div className={styles.orderSummary}>
            <h3 className="text-lg mb-6">Order Items</h3>
            <div className={styles.itemsList}>
              {order.items.map((item, i) => (
                <div key={i} className={styles.itemRow}>
                  <div className={styles.itemImgWrap}>
                    <Image 
                      src={(item as any).image || '/products/placeholder.jpg'} 
                      alt={item.product_name} 
                      fill 
                      className={styles.itemImg} 
                    />
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.product_name}</span>
                    <p className={styles.itemMeta}>
                      Qty: {item.quantity}
                      {item.size && ` • Size: ${item.size}`}
                      {item.color && ` • Color: ${item.color}`}
                    </p>
                    <p className={styles.itemPrice}>{formatCurrency(item.total_price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" style={{ margin: '24px 0' }} />

            <div className={styles.sumRow}>
              <span>Subtotal</span>
              <span className="font-mono">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className={styles.sumRow}>
              <span>VAT (15%)</span>
              <span className="font-mono">{formatCurrency(order.vat_amount)}</span>
            </div>
            <div className={styles.sumRow}>
              <span>Shipping</span>
              <span className="font-mono">
                {order.shipping_cost === 0 ? 'FREE' : formatCurrency(order.shipping_cost)}
              </span>
            </div>
            
            {order.payment_method && (
              <div className={styles.sumRow} style={{ marginTop: 8 }}>
                <span className="text-secondary text-sm">Payment</span>
                <span className="text-sm" style={{ textTransform: 'capitalize' }}>
                  {order.payment_method === 'momo' ? 'Mobile Money' : 'Card'}
                </span>
              </div>
            )}
            
            <div className="divider" style={{ margin: '16px 0' }} />
            
            <div className={`${styles.sumRow} ${styles.sumTotalRow}`}>
              <span>Total</span>
              <span className="font-mono text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>
          
          {/* Support Box */}
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <h4 className="text-sm font-medium mb-2">Need Help?</h4>
            <p className="text-secondary text-sm mb-3">
              Questions about your order? Contact our support team.
            </p>
            <Link href="/support" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
