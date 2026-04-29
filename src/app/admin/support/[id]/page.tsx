import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { fetchAdminTicket, fetchTicketMessages } from '@/lib/admin-data';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import styles from '../../page.module.css';

async function postReply(formData: FormData) {
  'use server';
  const ticketId = formData.get('ticketId') as string;
  const body = formData.get('body') as string;
  const senderId = formData.get('senderId') as string;

  if (!body?.trim()) return;

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  await db.from('ticket_messages').insert({
    ticket_id: ticketId,
    sender_id: senderId,
    body: body.trim(),
    is_ai_draft: false,
  });

  // Move ticket to in-progress if it's still open
  await db
    .from('tickets')
    .update({ status: 'in-progress', updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .eq('status', 'open');

  revalidatePath(`/admin/support/${ticketId}`);
}

async function resolveTicket(formData: FormData) {
  'use server';
  const ticketId = formData.get('ticketId') as string;
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  await db
    .from('tickets')
    .update({ status: 'resolved', updated_at: new Date().toISOString() })
    .eq('id', ticketId);
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath('/admin/support');
  revalidatePath('/admin');
}

function statusClass(status: string | null) {
  const map: Record<string, string> = {
    open:        styles.statusCancelled,
    'in-progress': styles.statusPending,
    resolved:    styles.statusDelivered,
  };
  return map[status ?? ''] ?? styles.statusPending;
}

export default async function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Get current admin user
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [ticket, messages] = await Promise.all([
    fetchAdminTicket(id),
    fetchTicketMessages(id),
  ]);

  if (!ticket) notFound();

  const isResolved = ticket.status === 'resolved';

  return (
    <div>
      {/* ── Header ─────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/admin/support" className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
            <ArrowLeft size={14} /> Back
          </Link>
          <div>
            <h1 className={styles.pageTitle} style={{ fontSize: '1.375rem' }}>
              {ticket.subject ?? 'Support Ticket'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <span className={`${styles.statusBadge} ${statusClass(ticket.status)}`}>
                {ticket.status?.replace('-', ' ') ?? 'open'}
              </span>
              <span className={styles.dateCell} style={{ fontSize: '0.8125rem' }}>
                {ticket.category} · {ticket.customer_name}
                {ticket.customer_email ? ` (${ticket.customer_email})` : ''}
              </span>
            </div>
          </div>
        </div>
        {!isResolved && (
          <form action={resolveTicket}>
            <input type="hidden" name="ticketId" value={ticket.id} />
            <button type="submit" className="btn btn-primary btn-sm" style={{ gap: 6 }}>
              <CheckCircle size={14} /> Mark Resolved
            </button>
          </form>
        )}
      </div>

      {/* ── Thread ────────────────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Conversation</h2>
          <span className={styles.dateCell} style={{ fontSize: '0.8125rem' }}>
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </span>
        </div>

        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No messages yet</p>
            <p className={styles.emptyText}>The conversation thread will appear here.</p>
          </div>
        ) : (
          <div className={styles.threadWrap}>
            {messages.map((msg) => {
              const isAdmin = msg.sender_role === 'admin';
              return (
                <div
                  key={msg.id}
                  className={`${styles.message} ${isAdmin ? styles.messageAdmin : ''}`}
                >
                  <div className={`${styles.messageSender} ${isAdmin ? styles.senderAdmin : styles.senderCustomer}`}>
                    {(msg.sender_name ?? 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.messageBubble}>{msg.body}</div>
                    <div className={`${styles.messageMeta} ${isAdmin ? '' : ''}`} style={{ textAlign: isAdmin ? 'right' : 'left' }}>
                      {isAdmin ? 'Admin' : (msg.sender_name ?? 'Customer')} ·{' '}
                      {new Date(msg.created_at).toLocaleString('en-GH', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Reply form ─────────────────────────────── */}
        {!isResolved && user && (
          <form action={postReply} className={styles.replyBox}>
            <input type="hidden" name="ticketId" value={ticket.id} />
            <input type="hidden" name="senderId" value={user.id} />
            <textarea
              name="body"
              className={styles.replyInput}
              placeholder="Type your reply to the customer…"
              required
            />
            <button type="submit" className="btn btn-primary btn-md" style={{ alignSelf: 'flex-end', gap: 6 }}>
              <Send size={14} /> Send
            </button>
          </form>
        )}

        {isResolved && (
          <div style={{ padding: '16px 24px', textAlign: 'center', color: '#4ade80', fontSize: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            ✓ This ticket has been resolved
          </div>
        )}
      </div>
    </div>
  );
}
