'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Truck, Package, CheckCircle, Clock, MapPin, ArrowLeft, Plus, History } from 'lucide-react';
import { getOrderWithTimeline, addTrackingEvent, upsertDelivery } from '@/lib/tracking-actions';
import styles from '../../../page.module.css';

const STATUS_FLOW = [
  { key: 'pending_payment', label: 'Pending Payment', icon: Clock },
  { key: 'paid', label: 'Paid', icon: CheckCircle },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: Package },
  { key: 'picked', label: 'Picked', icon: Package },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'handed_to_courier', label: 'Handed to Courier', icon: Truck },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DeliveryManagementPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [newStatus, setNewStatus] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  async function loadOrderData() {
    try {
      const result = await getOrderWithTimeline(orderId);
      if (result.success) {
        setOrder(result.order);
        setTimeline(result.timeline || []);
        setDelivery(result.delivery);
        setNewStatus(result.order?.status || '');
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newStatus || !description) return;

    setUpdating(true);
    try {
      const result = await addTrackingEvent(orderId, {
        status: newStatus,
        description,
        location: location || undefined,
      });

      if (result.success) {
        setDescription('');
        setLocation('');
        await loadOrderData();
      } else {
        alert('Failed to add event: ' + result.error);
      }
    } catch (error) {
      alert('Error adding event');
    } finally {
      setUpdating(false);
    }
  }

  async function handleUpdateDelivery(e: React.FormEvent) {
    e.preventDefault();

    setUpdating(true);
    try {
      const result = await upsertDelivery(orderId, {
        carrier,
        trackingNumber,
      });

      if (result.success) {
        await loadOrderData();
        alert('Delivery info updated');
      } else {
        alert('Failed to update: ' + result.error);
      }
    } catch (error) {
      alert('Error updating delivery');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>Order not found</div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.findIndex((s) => s.key === order.status);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <ArrowLeft size={18} />
          Back to Orders
        </button>
      </div>

      <h1 className={styles.pageTitle}>Delivery Management</h1>
      <p className={styles.pageSubtitle}>
        Order #{order.order_number || order.id.slice(0, 8)} - {order.customer_email}
      </p>

      {/* Status Flow */}
      <div className={styles.section} style={{ marginBottom: 24 }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Order Status Flow</h2>
        </div>
        <div style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'relative',
              marginBottom: '32px',
            }}
          >
            {/* Progress Line */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '0',
                right: '0',
                height: '4px',
                background: '#e5e7eb',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '0',
                height: '4px',
                background: '#2c5f2d',
                zIndex: 1,
                width: `${(currentStatusIndex / (STATUS_FLOW.length - 1)) * 100}%`,
              }}
            />

            {/* Status Nodes */}
            {STATUS_FLOW.map((status, index) => {
              const Icon = status.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div
                  key={status.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 2,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isCompleted ? '#2c5f2d' : '#f3f4f6',
                      border: `3px solid ${isCompleted ? '#2c5f2d' : '#e5e7eb'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <Icon
                      size={20}
                      style={{ color: isCompleted ? 'white' : '#9ca3af' }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: isCurrent ? 600 : 400,
                      color: isCompleted ? '#1a1a1a' : '#9ca3af',
                      textAlign: 'center',
                      maxWidth: '80px',
                    }}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Add Tracking Event */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Update Status</h2>
          </div>
          <form onSubmit={handleAddEvent} style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label className={styles.formLabel}>New Status</label>
              <select
                className={styles.formInput}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                {STATUS_FLOW.map((status) => (
                  <option key={status.key} value={status.key}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                className={styles.formInput}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Package picked up by courier"
                rows={3}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className={styles.formLabel}>Location (optional)</label>
              <input
                type="text"
                className={styles.formInput}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Accra Distribution Center"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={updating}
              style={{ width: '100%' }}
            >
              {updating ? 'Updating...' : 'Add Tracking Event'}
            </button>
          </form>
        </div>

        {/* Delivery Info */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Courier Details</h2>
          </div>
          <form onSubmit={handleUpdateDelivery} style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label className={styles.formLabel}>Carrier</label>
              <input
                type="text"
                className={styles.formInput}
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g., FedEx, DHL, Local Courier"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className={styles.formLabel}>Tracking Number</label>
              <input
                type="text"
                className={styles.formInput}
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking number"
              />
            </div>

            {delivery?.tracking_number && (
              <div
                style={{
                  padding: '12px',
                  background: '#f0fdf4',
                  borderRadius: '6px',
                  marginBottom: '16px',
                }}
              >
                <p style={{ margin: 0, fontSize: '14px', color: '#166534' }}>
                  <strong>Current Tracking:</strong> {delivery.tracking_number}
                </p>
                {delivery.carrier && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#15803d' }}>
                    Carrier: {delivery.carrier}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={updating}
              style={{ width: '100%' }}
            >
              {updating ? 'Saving...' : 'Update Delivery Info'}
            </button>
          </form>
        </div>
      </div>

      {/* Timeline */}
      <div className={styles.section} style={{ marginTop: '24px' }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Tracking Timeline</h2>
        </div>
        <div style={{ padding: '24px' }}>
          {timeline.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center' }}>
              No tracking events yet. Add your first event above.
            </p>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div
                style={{
                  position: 'absolute',
                  left: '20px',
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  background: '#e5e7eb',
                }}
              />

              {timeline.map((event, index) => {
                const StatusIcon =
                  STATUS_FLOW.find((s) => s.key === event.status)?.icon || History;

                return (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '24px',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#2c5f2d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1,
                        flexShrink: 0,
                      }}
                    >
                      <StatusIcon size={18} style={{ color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: 600,
                              color: '#1a1a1a',
                              textTransform: 'capitalize',
                            }}
                          >
                            {event.status.replace(/_/g, ' ')}
                          </p>
                          <p style={{ margin: '4px 0 0 0', color: '#4b5563', fontSize: '14px' }}>
                            {event.description}
                          </p>
                          {event.location && (
                            <p
                              style={{
                                margin: '4px 0 0 0',
                                color: '#6b7280',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <MapPin size={12} />
                              {event.location}
                            </p>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                          {formatDate(event.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
