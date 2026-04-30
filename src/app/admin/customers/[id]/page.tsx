'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  StickyNote, 
  Star, 
  Clock, 
  Send, 
  ArrowLeft, 
  Mail, 
  Phone,
  User,
  Trash2
} from 'lucide-react';
import { 
  getCustomerCommunications, 
  sendCommunication,
  getCustomerNotes,
  addCustomerNote,
  deleteCustomerNote,
  getCustomerFeedback,
  respondToFeedback,
  getCustomerTimeline 
} from '@/lib/crm-actions';
import styles from '../../page.module.css';

const TABS = [
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'communications', label: 'Communications', icon: MessageSquare },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'feedback', label: 'Feedback', icon: Star },
];

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [activeTab, setActiveTab] = useState('timeline');
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  
  // Data states
  const [timeline, setTimeline] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);

  // Form states
  const [commSubject, setCommSubject] = useState('');
  const [commContent, setCommContent] = useState('');
  const [commType, setCommType] = useState<'email' | 'sms' | 'call'>('email');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('general');
  const [feedbackResponse, setFeedbackResponse] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  async function loadCustomerData() {
    setLoading(true);
    try {
      // Load customer profile
      const response = await fetch(`/api/admin/customers/${customerId}`);
      const customerData = await response.json();
      setCustomer(customerData);

      // Load all CRM data
      const [
        timelineResult,
        commsResult,
        notesResult,
        feedbackResult,
      ] = await Promise.all([
        getCustomerTimeline(customerId),
        getCustomerCommunications(customerId),
        getCustomerNotes(customerId),
        getCustomerFeedback(customerId),
      ]);

      if (timelineResult.success) setTimeline(timelineResult.timeline || []);
      if (commsResult.success) setCommunications(commsResult.communications || []);
      if (notesResult.success) setNotes(notesResult.notes || []);
      if (feedbackResult.success) setFeedback(feedbackResult.feedback || []);
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCommunication(e: React.FormEvent) {
    e.preventDefault();
    if (!commContent) return;

    const result = await sendCommunication(customerId, {
      type: commType,
      subject: commSubject,
      content: commContent,
    });

    if (result.success) {
      setCommSubject('');
      setCommContent('');
      loadCustomerData();
    } else {
      alert('Failed to send: ' + result.error);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent) return;

    const result = await addCustomerNote(customerId, {
      note: noteContent,
      category: noteCategory,
    });

    if (result.success) {
      setNoteContent('');
      loadCustomerData();
    } else {
      alert('Failed to add note: ' + result.error);
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm('Delete this note?')) return;
    
    const result = await deleteCustomerNote(noteId, customerId);
    if (result.success) {
      loadCustomerData();
    }
  }

  async function handleRespondToFeedback(feedbackId: string) {
    if (!feedbackResponse) return;

    const result = await respondToFeedback(feedbackId, feedbackResponse);
    if (result.success) {
      setFeedbackResponse('');
      setRespondingTo(null);
      loadCustomerData();
    } else {
      alert('Failed to respond: ' + result.error);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString('en-GH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading customer...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <ArrowLeft size={18} />
          Back to Customers
        </button>
      </div>

      {customer && (
        <>
          {/* Customer Info Card */}
          <div className={styles.section} style={{ marginBottom: 24 }}>
            <div style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#2c5f2d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                {(customer.full_name?.[0] || customer.email?.[0] || 'G').toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h1 className={styles.pageTitle} style={{ margin: 0 }}>
                  {customer.full_name || 'Guest Customer'}
                </h1>
                <p style={{ margin: '8px 0 0 0', color: '#666', display: 'flex', gap: '24px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} />
                    {customer.email}
                  </span>
                  {customer.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} />
                      {customer.phone}
                    </span>
                  )}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#2c5f2d' }}>
                  {customer.total_orders || 0}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>Orders</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #2c5f2d' : 'none',
                    color: activeTab === tab.id ? '#2c5f2d' : '#666',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className={styles.section}>
            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0' }}>Customer Timeline</h3>
                {timeline.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center' }}>No activity yet.</p>
                ) : (
                  <div style={{ position: 'relative', paddingLeft: '24px' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '11px',
                        top: '0',
                        bottom: '0',
                        width: '2px',
                        background: '#e5e7eb',
                      }}
                    />
                    {timeline.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          gap: '16px',
                          marginBottom: '20px',
                          position: 'relative',
                        }}
                      >
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background:
                              item.type === 'order'
                                ? '#2c5f2d'
                                : item.type === 'communication'
                                ? '#3b82f6'
                                : item.type === 'feedback'
                                ? '#f59e0b'
                                : '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                            flexShrink: 0,
                            marginLeft: '-12px',
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 600, color: '#1a1a1a' }}>
                            {item.type === 'order' && `Order ${item.order_number || 'placed'}`}
                            {item.type === 'communication' && `${item.direction === 'outbound' ? 'Sent' : 'Received'} ${item.type}`}
                            {item.type === 'note' && 'Note added'}
                            {item.type === 'feedback' && `Feedback: ${item.rating} stars`}
                          </p>
                          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                            {item.content || item.note || item.feedback || `Status: ${item.status}`}
                          </p>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Communications Tab */}
            {activeTab === 'communications' && (
              <div style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0' }}>Send Message</h3>
                <form onSubmit={handleSendCommunication} style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <select
                        value={commType}
                        onChange={(e) => setCommType(e.target.value as any)}
                        style={{
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                        }}
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="call">Call Log</option>
                      </select>
                      {commType !== 'call' && (
                        <input
                          type="text"
                          placeholder="Subject"
                          value={commSubject}
                          onChange={(e) => setCommSubject(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                          }}
                        />
                      )}
                    </div>
                    <textarea
                      placeholder="Message content..."
                      value={commContent}
                      onChange={(e) => setCommContent(e.target.value)}
                      rows={4}
                      style={{
                        padding: '10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        resize: 'vertical',
                      }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                    >
                      <Send size={16} />
                      Send Message
                    </button>
                  </div>
                </form>

                <h3 style={{ margin: '0 0 20px 0' }}>Communication History</h3>
                {communications.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center' }}>No communications yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {communications.map((comm) => (
                      <div
                        key={comm.id}
                        style={{
                          padding: '16px',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${
                            comm.direction === 'outbound' ? '#2c5f2d' : '#3b82f6'
                          }`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              color: comm.direction === 'outbound' ? '#2c5f2d' : '#3b82f6',
                            }}
                          >
                            {comm.direction} • {comm.type}
                          </span>
                          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {formatDate(comm.created_at)}
                          </span>
                        </div>
                        {comm.subject && (
                          <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>{comm.subject}</p>
                        )}
                        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>{comm.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0' }}>Add Note</h3>
                <form onSubmit={handleAddNote} style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <select
                        value={noteCategory}
                        onChange={(e) => setNoteCategory(e.target.value)}
                        style={{
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                        }}
                      >
                        <option value="general">General</option>
                        <option value="vip">VIP</option>
                        <option value="complaint">Complaint</option>
                        <option value="follow_up">Follow-up Required</option>
                        <option value="internal">Internal Note</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Add a note about this customer..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      rows={3}
                      style={{
                        padding: '10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        resize: 'vertical',
                      }}
                    />
                    <button type="submit" className="btn btn-secondary">
                      Add Note
                    </button>
                  </div>
                </form>

                <h3 style={{ margin: '0 0 20px 0' }}>Customer Notes</h3>
                {notes.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center' }}>No notes yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        style={{
                          padding: '16px',
                          background: '#fef3c7',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                background: '#f59e0b',
                                color: 'white',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              {note.category}
                            </span>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {formatDate(note.created_at)}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: '#4b5563' }}>{note.note}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="Delete note"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0' }}>Customer Feedback</h3>
                {feedback.length === 0 ? (
                  <p style={{ color: '#666', textAlign: 'center' }}>No feedback yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {feedback.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '20px',
                          background: '#f0fdf4',
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill={i < item.rating ? '#f59e0b' : 'none'}
                                color={i < item.rating ? '#f59e0b' : '#d1d5db'}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 12px 0', color: '#4b5563' }}>{item.feedback}</p>
                        {item.order?.order_number && (
                          <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#6b7280' }}>
                            Order: {item.order.order_number}
                          </p>
                        )}
                        
                        {item.admin_response ? (
                          <div
                            style={{
                              padding: '12px',
                              background: 'white',
                              borderRadius: '6px',
                              marginTop: '12px',
                            }}
                          >
                            <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 600, color: '#2c5f2d' }}>
                              Admin Response:
                            </p>
                            <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>{item.admin_response}</p>
                          </div>
                        ) : (
                          respondingTo === item.id ? (
                            <div style={{ marginTop: '12px' }}>
                              <textarea
                                placeholder="Write a response..."
                                value={feedbackResponse}
                                onChange={(e) => setFeedbackResponse(e.target.value)}
                                rows={2}
                                style={{
                                  width: '100%',
                                  padding: '10px',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  marginBottom: '8px',
                                  resize: 'vertical',
                                }}
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleRespondToFeedback(item.id)}
                                  className="btn btn-sm btn-primary"
                                >
                                  Send Response
                                </button>
                                <button
                                  onClick={() => setRespondingTo(null)}
                                  className="btn btn-sm btn-ghost"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRespondingTo(item.id)}
                              className="btn btn-sm btn-secondary"
                              style={{ marginTop: '12px' }}
                            >
                              Respond to Feedback
                            </button>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
