'use client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Truck, CheckCircle2, ChevronRight } from 'lucide-react';
import { orders } from '@/lib/data';
import styles from './page.module.css';

export default function TrackOrderPage({ params }: { params: { id: string } }) {
  const order = orders.find(o => o.id === params.id);
  
  if (!order) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h1 className="font-display text-4xl mb-4">Order Not Found</h1>
          <p className="text-secondary mb-8">We couldn't find an order with the ID {params.id}.</p>
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
          <p className="text-secondary mt-2">Order {order.id}</p>
        </div>
        <div>
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
                    <p className={styles.nodeTime}>{order.date}</p>
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
                Kofi Mensah<br/>
                14 Oxford Street, Osu<br/>
                Accra, Greater Accra<br/>
                +233 24 123 4567
              </p>
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
                     <Image src={item.image} alt={item.name} fill className={styles.itemImg} />
                   </div>
                   <div className={styles.itemInfo}>
                     <span className={styles.itemName}>{item.name}</span>
                     <p className={styles.itemMeta}>Qty: {item.qty}</p>
                     <p className={styles.itemPrice}>GHS {item.price.toLocaleString()}</p>
                   </div>
                 </div>
               ))}
             </div>

             <div className="divider" style={{ margin: '24px 0' }} />

             <div className={styles.sumRow}><span>Subtotal</span><span className="font-mono">GHS {(order.total - 50).toLocaleString()}</span></div>
             <div className={styles.sumRow}><span>Delivery</span><span className="font-mono">GHS 50</span></div>
             <div className="divider" style={{ margin: '16px 0' }} />
             <div className={`${styles.sumRow} ${styles.sumTotalRow}`}><span>Total</span><span className="font-mono text-primary">GHS {order.total.toLocaleString()}</span></div>
           </div>
        </div>
      </div>
    </div>
  );
}
