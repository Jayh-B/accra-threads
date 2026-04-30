/**
 * Invoice PDF Generator
 * Creates professional PDF invoices using jsPDF
 */

import jsPDF from 'jspdf';

export interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  size?: string;
  color?: string;
}

export interface InvoiceData {
  invoice_number: string;
  generated_at: string;
  order_number?: string;
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
}

/**
 * Format amount from pesewas to GHS
 */
function formatGHS(amount: number): string {
  return `GHS ${((amount || 0) / 100).toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Generate PDF invoice
 */
export function generateInvoicePDF(invoice: InvoiceData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Colors
  const primaryColor = '#1a1a1a';
  const secondaryColor = '#666666';
  const accentColor = '#2c5f2d'; // Green for Accra Threads

  // ========== HEADER ==========
  // Company Logo/Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(accentColor);
  doc.text('ACCRA THREADS', margin, y);

  // Company Info (right side)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(secondaryColor);
  const companyInfo = [
    '14 Oxford Street, Osu',
    'Accra, Greater Accra',
    'Ghana',
    'info@accrathreads.com',
    '+233 24 123 4567',
  ];
  let companyY = y;
  companyInfo.forEach((line) => {
    doc.text(line, pageWidth - margin, companyY, { align: 'right' });
    companyY += 5;
  });

  y += 25;

  // ========== INVOICE TITLE ==========
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(primaryColor);
  doc.text('INVOICE', margin, y);

  // Invoice details (right side)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  const invoiceDetails = [
    `Invoice #: ${invoice.invoice_number}`,
    `Date: ${formatDate(invoice.generated_at)}`,
    invoice.order_number ? `Order #: ${invoice.order_number}` : '',
    `Payment: ${invoice.payment_method?.toUpperCase() || 'N/A'}`,
    `Status: ${invoice.payment_status?.toUpperCase() || 'PENDING'}`,
  ].filter(Boolean);

  let detailY = y;
  invoiceDetails.forEach((line) => {
    doc.text(line, pageWidth - margin, detailY, { align: 'right' });
    detailY += 6;
  });

  y += 35;

  // ========== BILL TO ==========
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor);
  doc.text('BILL TO:', margin, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);

  const billingLines = [
    invoice.customer_name,
    invoice.customer_email,
    invoice.customer_phone,
  ].filter(Boolean);

  // Add address if available
  if (invoice.billing_address) {
    const addr = invoice.billing_address;
    if (addr.address) billingLines.push(addr.address);
    if (addr.city && addr.region) {
      billingLines.push(`${addr.city}, ${addr.region}`);
    }
  }

  billingLines.forEach((line) => {
    doc.text(line || '', margin, y);
    y += 6;
  });

  y += 15;

  // ========== ITEMS TABLE ==========
  // Table header
  const colX = {
    item: margin,
    qty: margin + 80,
    price: margin + 110,
    total: margin + 140,
  };

  // Header background
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 6, pageWidth - margin * 2, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor);
  doc.text('Item', colX.item, y);
  doc.text('Qty', colX.qty, y);
  doc.text('Unit Price', colX.price, y);
  doc.text('Total', colX.total, y);

  y += 12;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);

  invoice.items.forEach((item, index) => {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    // Alternate row background
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y - 6, pageWidth - margin * 2, 8, 'F');
    }

    // Item name with size/color
    let itemText = item.product_name;
    if (item.size || item.color) {
      const variants = [item.size, item.color].filter(Boolean).join(', ');
      itemText += ` (${variants})`;
    }
    doc.text(itemText, colX.item, y);

    doc.text(item.quantity.toString(), colX.qty, y);
    doc.text(formatGHS(item.unit_price), colX.price, y);
    doc.text(formatGHS(item.total_price), colX.total, y);

    y += 10;
  });

  // Table bottom border
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);

  // ========== TOTALS ==========
  y += 15;
  const totalsX = pageWidth - margin - 60;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);

  // Subtotal
  doc.text('Subtotal:', totalsX, y);
  doc.text(formatGHS(invoice.subtotal), pageWidth - margin, y, { align: 'right' });
  y += 8;

  // VAT
  doc.text('VAT (15%):', totalsX, y);
  doc.text(formatGHS(invoice.vat_amount), pageWidth - margin, y, { align: 'right' });
  y += 8;

  // Shipping
  doc.text('Shipping:', totalsX, y);
  doc.text(formatGHS(invoice.shipping_cost), pageWidth - margin, y, { align: 'right' });
  y += 12;

  // Total (bold)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text('TOTAL:', totalsX, y);
  doc.text(formatGHS(invoice.total), pageWidth - margin, y, { align: 'right' });

  // ========== FOOTER ==========
  y = doc.internal.pageSize.getHeight() - 30;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(secondaryColor);
  doc.text('Thank you for shopping with Accra Threads!', margin, y);

  y += 8;
  doc.text('For questions about this invoice, please contact us at info@accrathreads.com', margin, y);

  return doc;
}

/**
 * Download invoice PDF
 */
export function downloadInvoicePDF(invoice: InvoiceData, filename?: string): void {
  const doc = generateInvoicePDF(invoice);
  const defaultFilename = `Invoice-${invoice.invoice_number}.pdf`;
  doc.save(filename || defaultFilename);
}

/**
 * Get PDF as blob for email attachment
 */
export function getInvoicePDFBlob(invoice: InvoiceData): Blob {
  const doc = generateInvoicePDF(invoice);
  return doc.output('blob');
}

/**
 * Get PDF as data URI for preview
 */
export function getInvoicePDFDataUri(invoice: InvoiceData): string {
  const doc = generateInvoicePDF(invoice);
  return doc.output('datauristring');
}
