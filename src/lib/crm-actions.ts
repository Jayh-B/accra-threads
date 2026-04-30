'use server';

import { getAdminClient } from './admin-data';
import { revalidatePath } from 'next/cache';
import { sendEmail } from './email';

console.log('💬 crm-actions.ts module loaded');

// ============================================================================
// CUSTOMER COMMUNICATIONS
// ============================================================================

export type Communication = {
  id: string;
  customer_id: string;
  order_id: string | null;
  type: 'email' | 'sms' | 'note' | 'call';
  direction: 'inbound' | 'outbound';
  subject: string | null;
  content: string;
  sent_at: string | null;
  read_at: string | null;
  created_by: string | null;
  created_at: string;
};

/**
 * Send communication to customer
 */
export async function sendCommunication(
  customerId: string,
  data: {
    type: 'email' | 'sms' | 'call';
    subject?: string;
    content: string;
    orderId?: string;
  }
): Promise<{ success: boolean; communicationId?: string; error?: string }> {
  console.log(`[CRM] Sending ${data.type} to customer: ${customerId}`);
  const db = getAdminClient();

  try {
    // Get customer details
    const { data: customer, error: customerError } = await db
      .from('profiles')
      .select('email, full_name')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      return { success: false, error: 'Customer not found' };
    }

    // Create communication record
    const { data: communication, error: commError } = await db
      .from('customer_communications')
      .insert({
        customer_id: customerId,
        order_id: data.orderId || null,
        type: data.type,
        direction: 'outbound',
        subject: data.subject || null,
        content: data.content,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (commError) {
      console.error('[CRM] Failed to create communication:', commError);
      return { success: false, error: commError.message };
    }

    // If email, send actual email
    if (data.type === 'email' && customer.email) {
      await sendEmail({
        to: customer.email,
        subject: data.subject || 'Message from Accra Threads',
        html: `
          <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #222;">
            <h2 style="color: #2c5f2d;">Accra Threads</h2>
            <p>Hi ${customer.full_name || 'there'},</p>
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              ${data.content.replace(/\n/g, '<br/>')}
            </div>
            <p style="color: #666; font-size: 12px;">
              This message was sent by our customer service team.
              Reply to this email or contact us at support@accrathreads.com
            </p>
          </div>
        `,
      });
    }

    console.log(`[CRM] ✅ Communication sent: ${communication.id}`);
    revalidatePath(`/admin/customers/${customerId}`);
    
    return { success: true, communicationId: communication.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CRM] ❌ Error:', message);
    return { success: false, error: message };
  }
}

/**
 * Get customer communications
 */
export async function getCustomerCommunications(
  customerId: string
): Promise<{ success: boolean; communications?: Communication[]; error?: string }> {
  const db = getAdminClient();

  try {
    const { data: communications, error } = await db
      .from('customer_communications')
      .select(`
        *,
        order:orders(order_number)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, communications: communications || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch communications' };
  }
}

// ============================================================================
// CUSTOMER NOTES
// ============================================================================

export type CustomerNote = {
  id: string;
  customer_id: string;
  note: string;
  category: string;
  created_by: string | null;
  created_at: string;
};

/**
 * Add note to customer
 */
export async function addCustomerNote(
  customerId: string,
  data: {
    note: string;
    category?: string;
  }
): Promise<{ success: boolean; noteId?: string; error?: string }> {
  console.log(`[CRM] Adding note for customer: ${customerId}`);
  const db = getAdminClient();

  try {
    const { data: note, error } = await db
      .from('customer_notes')
      .insert({
        customer_id: customerId,
        note: data.note,
        category: data.category || 'general',
      })
      .select()
      .single();

    if (error) {
      console.error('[CRM] Failed to add note:', error);
      return { success: false, error: error.message };
    }

    console.log(`[CRM] ✅ Note added: ${note.id}`);
    revalidatePath(`/admin/customers/${customerId}`);
    
    return { success: true, noteId: note.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Get customer notes
 */
export async function getCustomerNotes(
  customerId: string
): Promise<{ success: boolean; notes?: CustomerNote[]; error?: string }> {
  const db = getAdminClient();

  try {
    const { data: notes, error } = await db
      .from('customer_notes')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, notes: notes || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch notes' };
  }
}

/**
 * Delete customer note
 */
export async function deleteCustomerNote(
  noteId: string,
  customerId: string
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminClient();

  try {
    const { error } = await db
      .from('customer_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/admin/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete note' };
  }
}

// ============================================================================
// CUSTOMER FEEDBACK
// ============================================================================

export type CustomerFeedback = {
  id: string;
  customer_id: string;
  order_id: string | null;
  product_id: string | null;
  rating: number;
  feedback: string;
  category: string;
  created_at: string;
  admin_response: string | null;
  responded_at: string | null;
};

/**
 * Submit customer feedback
 */
export async function submitFeedback(
  data: {
    customerId: string;
    orderId?: string;
    productId?: string;
    rating: number;
    feedback: string;
    category?: string;
  }
): Promise<{ success: boolean; feedbackId?: string; error?: string }> {
  console.log(`[CRM] Submitting feedback from customer: ${data.customerId}`);
  const db = getAdminClient();

  try {
    const { data: feedback, error } = await db
      .from('customer_feedback')
      .insert({
        customer_id: data.customerId,
        order_id: data.orderId || null,
        product_id: data.productId || null,
        rating: data.rating,
        feedback: data.feedback,
        category: data.category || 'general',
      })
      .select()
      .single();

    if (error) {
      console.error('[CRM] Failed to submit feedback:', error);
      return { success: false, error: error.message };
    }

    console.log(`[CRM] ✅ Feedback submitted: ${feedback.id}`);
    
    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Get customer feedback
 */
export async function getCustomerFeedback(
  customerId?: string
): Promise<{ success: boolean; feedback?: CustomerFeedback[]; error?: string }> {
  const db = getAdminClient();

  try {
    let query = db
      .from('customer_feedback')
      .select(`
        *,
        customer:profiles(full_name, email),
        order:orders(order_number),
        product:products(name)
      `)
      .order('created_at', { ascending: false });

    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: feedback, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, feedback: feedback || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch feedback' };
  }
}

/**
 * Respond to feedback (admin only)
 */
export async function respondToFeedback(
  feedbackId: string,
  response: string
): Promise<{ success: boolean; error?: string }> {
  const db = getAdminClient();

  try {
    const { error } = await db
      .from('customer_feedback')
      .update({
        admin_response: response,
        responded_at: new Date().toISOString(),
      })
      .eq('id', feedbackId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to respond to feedback' };
  }
}

/**
 * Get customer timeline (combined view)
 */
export async function getCustomerTimeline(
  customerId: string
): Promise<{ success: boolean; timeline?: any[]; error?: string }> {
  const db = getAdminClient();

  try {
    // Fetch all data in parallel
    const [
      { data: communications },
      { data: notes },
      { data: feedback },
      { data: orders },
    ] = await Promise.all([
      db
        .from('customer_communications')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false }),
      db
        .from('customer_notes')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false }),
      db
        .from('customer_feedback')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false }),
      db
        .from('orders')
        .select('id, order_number, status, total, created_at')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false }),
    ]);

    // Combine into timeline
    const timeline = [
      ...(communications || []).map((c) => ({ ...c, type: 'communication' })),
      ...(notes || []).map((n) => ({ ...n, type: 'note' })),
      ...(feedback || []).map((f) => ({ ...f, type: 'feedback' })),
      ...(orders || []).map((o) => ({ ...o, type: 'order' })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { success: true, timeline };
  } catch (error) {
    return { success: false, error: 'Failed to fetch timeline' };
  }
}
