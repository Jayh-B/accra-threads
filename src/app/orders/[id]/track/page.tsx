'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Truck, CheckCircle2, ChevronRight, FileText, Clock, MapPin, History } from 'lucide-react';
import { getOrderById } from '@/lib/order-data';
import { getInvoiceByOrderId } from '@/lib/invoice-actions';
import { getOrderWithTimeline } from '@/lib/tracking-actions';
import styles from './page.module.css';

import { OrderWithItems } from '@/lib/order-data';

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string | null;
  created_at: string;
}

type Order = OrderWithItems;

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  pending_payment: { label: 'Pending Payment', icon: Clock, color: '#f59e0b' },
  paid: { label: 'Paid', icon: CheckCircle2, color: '#10b981' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: '#10b981' },
  processing: { label: 'Processing', icon: Package, color: '#3b82f6' },
  ready_for_pickup: { label: 'Ready for Pickup', icon: Package, color: '#3b82f6' },
  picked: { label: 'Picked', icon: Package, color: '#3b82f6' },
  packed: { label: 'Packed', icon: Package, color: '#3b82f6' },
  handed_to_courier: { label: 'Handed to Courier', icon: Truck, color: '#8b5cf6' },
  in_transit: { label: 'In Transit', icon: Truck, color: '#8b5cf6' },
  out_for_delivery: { label: 'Out for Delivery', icon: Truck, color: '#8b5cf6' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: '#10b981' },
  cancelled: { label: 'Cancelled', icon: Clock, color: '#ef4444' },
};

export default function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasInvoice, setHasInvoice] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        // Try to get full timeline data
        const timelineResult = await getOrderWithTimeline(id);
        if (timelineResult.success && timelineResult.order) {
          setOrder(timelineResult.order as Order);
          setTimeline(timelineResult.timeline || []);
        } else {
          // Fallback to basic order data
          const orderData = await getOrderById(id);
          if (orderData) {
            setOrder(orderData);
          }
        }
        
        // Check if invoice exists
        const invoiceResult = await getInvoiceByOrderId(id);
        setHasInvoice(invoiceResult.success);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);
  
  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <p className="text-secondary">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h1 className="font-display text-4xl mb-4">Order Not Found</h1>
          <p className="text-secondary mb-8">We couldn&apos;t find an order with the ID {id}.</p>
           <Link href="/account?tab=orders" className="btn btn-primary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  // derive progress (0-4) based on string status
  const statuses = ['processing', 'shipped', 'out_for_delivery', 'delivered'];
  const curIdx = statuses.indexOf(order.status);
  const progressPercent = curIdx >= 0 ? (curIdx / 3) * 100 : 0;

  return (
    <div className={styles.page}>
      
      <div className={styles.breadcrumb}>
        <Link href="/account?tab=orders">Account</Link> <ChevronRight size={14}/>
        <Link href="/account?tab=orders">Orders</Link> <ChevronRight size={14}/>
        <span>{order.id}</span>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className="font-display text-3xl">Track Package</h1>
          <p className="text-secondary mt-2">Order {order.order_number || order.id.slice(0, 8)}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {hasInvoice && (
            <Link 
              href={`/account/orders/${order.id}/invoice`}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FileText size={16} />
              View Invoice
            </Link>
          )}
           {order.status === 'delivered' ? (
             <span className="badge badge-cowrie text-sm px-4 py-2">Delivered</span>
           ) : (
             <span className="badge badge-primary text-sm px-4 py-2">In Transit</span>
           )}
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left: Tracker */}
        <div className={styles.main}>
          <div className={styles.statusBox}>
            <div className={styles.progressWrap}>
              <div className={styles.progressBarBg}>
                <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
              </div>
              
              <div className={styles.nodes}>
                {/* Processing */}
                <div className={`${styles.node} ${curIdx >= 0 ? styles.nodeDone : ''}`}>
                  <div className={styles.iconWrap}><Package size={20} /></div>
                  <div className={styles.nodeLabels}>
                    <p className={styles.nodeTitle}>Processing</p>
                    <p className={styles.nodeTime}>{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Shipped */}
                 <div className={`${styles.node} ${curIdx >= 1 ? styles.nodeDone : ''}`}>
                  <div className={styles.iconWrap}><Truck size={20} /></div>
                  <div className={styles.nodeLabels}>
                    <p className={styles.nodeTitle}>Shipped</p>
                    {curIdx >= 1 && <p className={styles.nodeTime}>Package left facility</p>}
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
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.deliveryDetails}>
              <h3 className="text-lg mb-4">Delivery Address</h3>
              <p className="text-secondary text-sm leading-relaxed">
                {order.shipping_address?.first_name} {order.shipping_address?.last_name}<br/>
                {order.shipping_address?.address}<br/>
                {order.shipping_address?.city}{order.shipping_address?.city && order.shipping_address?.region && ', '} {order.shipping_address?.region}<br/>
                {order.shipping_address?.phone}
              </p>
            </div>

            {/* Detailed Timeline */}
            {timeline.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 className="text-lg mb-4">Tracking History</h3>
                <div style={{ position: 'relative', paddingLeft: '24px' }}>
                  {/* Timeline line */}
                  <div style={{
                    position: 'absolute',
                    left: '11px',
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    background: '#e5e7eb',
                  }} />
                  
                  {timeline.slice().reverse().map((event, index) => {
                    const config = STATUS_CONFIG[event.status] || { label: event.status, icon: History, color: '#9ca3af' };
                    const Icon = config.icon;
                    
                    return (
                      <div key={event.id} style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '20px',
                        position: 'relative',
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: config.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1,
                          flexShrink: 0,
                          marginLeft: '-12px',
                        }}>
                          <Icon size={12} style={{ color: 'white' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                                {config.label}
                              </p>
                              <p style={{ margin: '4px 0 0 0', color: '#4b5563', fontSize: '13px' }}>
                                {event.description}
                              </p>
                              {event.location && (
                                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <MapPin size={12} />
                                  {event.location}
                                </p>
                              )}
                            </div>
                            <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                              {new Date(event.created_at).toLocaleString('en-GH', {
                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className={styles.side}>
           <div className={styles.orderSummary}>
             <h3 className="text-lg mb-6">Order Items</h3>
             <div className={styles.itemsList}>
               {(order.items || []).map((item, i) => (
                 <div key={i} className={styles.itemRow}>
                   <div className={styles.itemImgWrap}>
                     <Image src={item.image || '/products/placeholder.jpg'} alt={item.product_name} fill className={styles.itemImg} />
                   </div>
                   <div className={styles.itemInfo}>
                     <span className={styles.itemName}>{item.product_name}</span>
                     <p className={styles.itemMeta}>Qty: {item.quantity}</p>
                     <p className={styles.itemPrice}>GHS {item.total_price.toLocaleString()}</p>
                   </div>
                 </div>
               ))}
             </div>

             <div className="divider" style={{ margin: '24px 0' }} />

             <div className={styles.sumRow}><span>Subtotal</span><span className="font-mono">GHS {order.subtotal.toLocaleString()}</span></div>
             <div className={styles.sumRow}><span>VAT (15%)</span><span className="font-mono">GHS {order.vat_amount.toLocaleString()}</span></div>
             <div className={styles.sumRow}><span>Delivery</span><span className="font-mono">{order.shipping_cost === 0 ? 'FREE' : `GHS ${order.shipping_cost.toLocaleString()}`}</span></div>
             <div className="divider" style={{ margin: '16px 0' }} />
             <div className={`${styles.sumRow} ${styles.sumTotalRow}`}><span>Total</span><span className="font-mono text-primary">GHS {order.total.toLocaleString()}</span></div>
           </div>
        </div>
      </div>
    </div>
  );
}
