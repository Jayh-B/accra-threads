'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Download, Printer, Mail, ArrowLeft, FileText } from 'lucide-react';
import { getInvoiceByOrderId } from '@/lib/invoice-actions';
import { downloadInvoicePDF } from '@/lib/invoice-pdf';
import styles from './invoice.module.css';

interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  size?: string;
  color?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  generated_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  billing_address: {
    first_name?: string;
    last_name?: string;
    address?: string;
    city?: string;
    region?: string;
    phone?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  vat_amount: number;
  shipping_cost: number;
  total: number;
  payment_method?: string;
  payment_status?: string;
  order?: {
    order_number: string;
  };
}

function formatGHS(amount: number): string {
  return `GHS ${((amount || 0) / 100).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function InvoicePage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      try {
        const result = await getInvoiceByOrderId(orderId);
        if (result.success && result.invoice) {
          setInvoice(result.invoice);
        } else {
          setError(result.error || 'Invoice not found');
        }
      } catch (err) {
        setError('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [orderId]);

  const handleDownloadPDF = () => {
    if (invoice) {
      downloadInvoicePDF(invoice);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <FileText size={48} className={styles.loadingIcon} />
          <p>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error || 'Invoice not available'}</p>
          <button 
            onClick={() => window.history.back()}
            className={styles.backButton}
          >
            <ArrowLeft size={16} />
            Back to Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button 
          onClick={() => window.history.back()}
          className={styles.backButton}
        >
          <ArrowLeft size={16} />
          Back to Order
        </button>
        <div className={styles.actions}>
          <button onClick={handlePrint} className={styles.actionButton}>
            <Printer size={18} />
            Print
          </button>
          <button onClick={handleDownloadPDF} className={styles.actionButtonPrimary}>
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice */}
      <div className={styles.invoice} id="invoice">
        {/* Invoice Header */}
        <div className={styles.invoiceHeader}>
          <div>
            <h1 className={styles.companyName}>ACCRA THREADS</h1>
            <p className={styles.companyInfo}>Premium Streetwear from Ghana</p>
            <p className={styles.companyAddress}>
              14 Oxford Street, Osu<br />
              Accra, Greater Accra<br />
              info@accrathreads.com
            </p>
          </div>
          <div className={styles.invoiceMeta}>
            <h2 className={styles.invoiceTitle}>INVOICE</h2>
            <p className={styles.metaItem}>
              <strong>Invoice #:</strong> {invoice.invoice_number}
            </p>
            <p className={styles.metaItem}>
              <strong>Date:</strong> {formatDate(invoice.generated_at)}
            </p>
            {invoice.order?.order_number && (
              <p className={styles.metaItem}>
                <strong>Order #:</strong> {invoice.order.order_number}
              </p>
            )}
            <p className={styles.metaItem}>
              <strong>Payment:</strong> {invoice.payment_method?.toUpperCase() || 'N/A'}
            </p>
            <p className={styles.metaItem}>
              <span className={`${styles.status} ${styles[invoice.payment_status || 'pending']}`}>
                {invoice.payment_status?.toUpperCase() || 'PENDING'}
              </span>
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className={styles.billTo}>
          <h3 className={styles.sectionTitle}>BILL TO:</h3>
          <p className={styles.customerName}>{invoice.customer_name}</p>
          <p className={styles.customerEmail}>{invoice.customer_email}</p>
          {invoice.customer_phone && (
            <p className={styles.customerPhone}>{invoice.customer_phone}</p>
          )}
          {invoice.billing_address && (
            <div className={styles.address}>
              {invoice.billing_address.address && (
                <p>{invoice.billing_address.address}</p>
              )}
              {(invoice.billing_address.city || invoice.billing_address.region) && (
                <p>
                  {invoice.billing_address.city}
                  {invoice.billing_address.city && invoice.billing_address.region && ', '}
                  {invoice.billing_address.region}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Items Table */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.itemCol}>Item</th>
              <th className={styles.qtyCol}>Qty</th>
              <th className={styles.priceCol}>Unit Price</th>
              <th className={styles.totalCol}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.itemCell}>
                  <p className={styles.productName}>{item.product_name}</p>
                  {(item.size || item.color) && (
                    <p className={styles.variants}>
                      {[item.size, item.color].filter(Boolean).join(', ')}
                    </p>
                  )}
                </td>
                <td className={styles.qtyCell}>{item.quantity}</td>
                <td className={styles.priceCell}>{formatGHS(item.unit_price)}</td>
                <td className={styles.totalCell}>{formatGHS(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className={styles.totals}>
          <div className={styles.totalsRow}>
            <span>Subtotal:</span>
            <span>{formatGHS(invoice.subtotal)}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>VAT (15%):</span>
            <span>{formatGHS(invoice.vat_amount)}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Shipping:</span>
            <span>{invoice.shipping_cost === 0 ? 'FREE' : formatGHS(invoice.shipping_cost)}</span>
          </div>
          <div className={`${styles.totalsRow} ${styles.grandTotal}`}>
            <span>TOTAL:</span>
            <span>{formatGHS(invoice.total)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>Thank you for shopping with Accra Threads!</p>
          <p className={styles.support}>
            For questions about this invoice, contact us at{' '}
            <a href="mailto:support@accrathreads.com">support@accrathreads.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
