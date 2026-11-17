import { jsPDF } from 'jspdf';
import { IInvoice, IBusinessSettings } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export function generateInvoicePDF(invoice: IInvoice, settings?: IBusinessSettings | null) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const businessName = settings?.businessName || 'Billora Cloud Inc.';
  const businessEmail = settings?.businessEmail || 'billing@billora.io';
  const businessPhone = settings?.businessPhone || '+1 (555) 019-2834';
  const businessAddress = `${settings?.businessAddress || '100 Innovation Way'}, ${settings?.city || 'San Francisco'}, ${settings?.state || 'CA'} ${settings?.postalCode || '94107'}`;

  const cust = invoice.customerId as unknown as {
    fullName?: string;
    email?: string;
    companyName?: string;
    billingAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  // Header Banner
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('BILLORA', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(224, 231, 255);
  doc.text('Smart Billing. Simple Business.', 50, 16);

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', 196, 16, { align: 'right' });

  // Business info & Invoice meta
  let y = 36;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(businessName, 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  y += 5;
  doc.text(businessAddress, 14, y);
  y += 4;
  doc.text(`${businessEmail}  |  ${businessPhone}`, 14, y);

  // Meta box on top right
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 196, 36, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issue Date: ${formatDate(invoice.issueDate)}`, 196, 42, { align: 'right' });
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 196, 47, { align: 'right' });
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 196, 52, { align: 'right' });

  // Divider
  y = 58;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);

  // Bill To section
  y += 8;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('BILLED TO:', 14, y);

  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(cust?.fullName || 'Customer', 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  if (cust?.companyName) {
    y += 4;
    doc.text(cust.companyName, 14, y);
  }
  y += 4;
  doc.text(cust?.email || '', 14, y);
  if (cust?.billingAddress) {
    y += 4;
    doc.text(`${cust.billingAddress}, ${cust.city || ''} ${cust.state || ''} ${cust.postalCode || ''}`, 14, y);
  }

  // Line items table header
  y += 12;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y - 4, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('ITEM & DESCRIPTION', 18, y + 1);
  doc.text('QTY', 125, y + 1, { align: 'center' });
  doc.text('UNIT PRICE', 155, y + 1, { align: 'right' });
  doc.text('AMOUNT', 192, y + 1, { align: 'right' });

  // Line items
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  invoice.lineItems.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.text(item.description, 18, y);
    doc.text(String(item.quantity), 125, y, { align: 'center' });
    doc.text(formatCurrency(item.unitPrice, invoice.currency), 155, y, { align: 'right' });
    doc.text(formatCurrency(item.amount, invoice.currency), 192, y, { align: 'right' });
    y += 6;
  });

  // Table bottom border
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);

  // Totals breakdown on bottom right
  y += 6;
  const rightLabelX = 150;
  const rightValueX = 192;

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  doc.text('Subtotal:', rightLabelX, y, { align: 'right' });
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), rightValueX, y, { align: 'right' });
  y += 5;

  if (invoice.discountAmount > 0) {
    doc.text(`Discount (${invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : 'Fixed'}):`, rightLabelX, y, { align: 'right' });
    doc.text(`-${formatCurrency(invoice.discountAmount, invoice.currency)}`, rightValueX, y, { align: 'right' });
    y += 5;
  }

  if (invoice.taxAmount > 0) {
    doc.text(`Tax (${invoice.taxRate}%):`, rightLabelX, y, { align: 'right' });
    doc.text(formatCurrency(invoice.taxAmount, invoice.currency), rightValueX, y, { align: 'right' });
    y += 5;
  }

  // Grand Total
  y += 2;
  doc.setFillColor(241, 245, 249);
  doc.rect(rightLabelX - 30, y - 4, 76, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('TOTAL:', rightLabelX, y + 2, { align: 'right' });
  doc.text(formatCurrency(invoice.totalAmount, invoice.currency), rightValueX, y + 2, { align: 'right' });

  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text('Amount Paid:', rightLabelX, y, { align: 'right' });
  doc.text(formatCurrency(invoice.paidAmount, invoice.currency), rightValueX, y, { align: 'right' });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(invoice.balance > 0 ? 225 : 100, invoice.balance > 0 ? 29 : 116, invoice.balance > 0 ? 72 : 139);
  doc.text('Balance Due:', rightLabelX, y, { align: 'right' });
  doc.text(formatCurrency(invoice.balance, invoice.currency), rightValueX, y, { align: 'right' });

  // Notes
  if (invoice.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Notes & Payment Terms:', 14, y - 10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(invoice.notes, 14, y - 5);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for your business. For questions contact support@billora.io.', 105, 285, {
    align: 'center',
  });

  // Save PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}

