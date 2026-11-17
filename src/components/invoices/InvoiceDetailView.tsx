'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IInvoice, IPayment, IBusinessSettings } from '@/types';
import {
  ArrowLeft,
  Download,
  CreditCard,
  Printer,
  Calendar,
  Building,
  Mail,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { generateInvoicePDF } from './InvoicePDF';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';

interface InvoiceDetailViewProps {
  invoice: IInvoice & {
    payments?: IPayment[];
    businessSettings?: IBusinessSettings | null;
  };
  onRefresh: () => void;
}

export function InvoiceDetailView({ invoice, onRefresh }: InvoiceDetailViewProps) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const cust = invoice.customerId as unknown as {
    _id?: string;
    fullName?: string;
    email?: string;
    companyName?: string;
    billingAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  const settings = invoice.businessSettings;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                {invoice.invoiceNumber}
              </h1>
              <Badge status={invoice.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Issued on {formatDate(invoice.issueDate, 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoice.status !== 'paid' && invoice.balance > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPaymentModalOpen(true)}
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              Record Payment
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => generateInvoicePDF(invoice, settings)}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden sm:inline-flex"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print
          </Button>
        </div>
      </div>

      {/* Printable Invoice Card */}
      <Card className="p-6 sm:p-10 shadow-sm print:shadow-none print:border-none">
        {/* Brand & Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between pb-8 border-b border-slate-100 dark:border-slate-800 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {settings?.businessName || 'Billora Cloud Inc.'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              {settings?.businessAddress || '100 Innovation Way, Suite 400'}
              <br />
              {[settings?.city || 'San Francisco', settings?.state || 'CA', settings?.postalCode || '94107'].join(', ')}
              <br />
              {settings?.businessEmail || 'billing@billora.io'}
            </p>
          </div>

          <div className="sm:text-right space-y-1 text-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Invoice
            </span>
            <p className="font-mono font-bold text-lg text-slate-900 dark:text-slate-100">
              {invoice.invoiceNumber}
            </p>
            <p className="text-slate-500">
              Issue Date: <strong className="text-slate-700 dark:text-slate-300">{formatDate(invoice.issueDate)}</strong>
            </p>
            <p className="text-slate-500">
              Due Date: <strong className="text-slate-700 dark:text-slate-300">{formatDate(invoice.dueDate)}</strong>
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="py-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-6 text-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Billed To
            </span>
            {cust ? (
              <div className="space-y-0.5">
                <Link
                  href={`/customers/${cust._id}`}
                  className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 text-sm block"
                >
                  {cust.fullName}
                </Link>
                {cust.companyName && <p className="text-slate-600 dark:text-slate-400 font-medium">{cust.companyName}</p>}
                <p className="text-slate-500">{cust.email}</p>
                {cust.billingAddress && (
                  <p className="text-slate-500 leading-relaxed">
                    {cust.billingAddress}
                    <br />
                    {[cust.city, cust.state, cust.postalCode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-400">—</p>
            )}
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Payment Status
            </span>
            <div className="sm:inline-block">
              <Badge status={invoice.status} className="text-xs py-1 px-3" />
            </div>
            {invoice.balance > 0 && (
              <p className="text-rose-600 dark:text-rose-400 font-semibold text-xs mt-2">
                Balance Due: {formatCurrency(invoice.balance, invoice.currency)}
              </p>
            )}
          </div>
        </div>

        {/* Item Table */}
        <div className="py-6 border-b border-slate-100 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-center w-20">Qty</TableHead>
                <TableHead className="text-right w-28">Unit Price</TableHead>
                <TableHead className="text-right w-28">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-center text-slate-600 dark:text-slate-400">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.amount, invoice.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals Breakdown */}
        <div className="py-6 flex flex-col sm:flex-row justify-between gap-6 text-xs">
          <div className="max-w-xs space-y-1">
            {invoice.notes && (
              <>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Notes & Terms
                </span>
                <p className="text-slate-500 leading-relaxed">{invoice.notes}</p>
              </>
            )}
          </div>

          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatCurrency(invoice.subtotal, invoice.currency)}
              </span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>
                  Discount ({invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : 'Fixed'}):
                </span>
                <span>-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
              </div>
            )}

            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>+{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline font-bold text-sm text-slate-900 dark:text-slate-100">
              <span>Total:</span>
              <span className="text-base text-indigo-600 dark:text-indigo-400 font-extrabold">
                {formatCurrency(invoice.totalAmount, invoice.currency)}
              </span>
            </div>

            <div className="flex justify-between text-emerald-600 font-medium pt-1">
              <span>Amount Paid:</span>
              <span>{formatCurrency(invoice.paidAmount, invoice.currency)}</span>
            </div>

            <div className="flex justify-between items-baseline font-bold text-xs pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
              <span className={invoice.balance > 0 ? 'text-rose-600' : 'text-slate-500'}>
                Remaining Balance:
              </span>
              <span className={invoice.balance > 0 ? 'text-rose-600 font-extrabold text-sm' : 'text-slate-400'}>
                {formatCurrency(invoice.balance, invoice.currency)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment History on this Invoice */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recorded Payments</CardTitle>
            <CardDescription>Simulated payment transactions for this invoice</CardDescription>
          </div>
          {invoice.balance > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaymentModalOpen(true)}
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              Add Payment
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!invoice.payments || invoice.payments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No payment records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono font-semibold">{p.paymentId}</TableCell>
                    <TableCell>{formatDate(p.paymentDate, 'MMM dd, yyyy h:mm a')}</TableCell>
                    <TableCell className="capitalize">{p.paymentMethod.replace('_', ' ')}</TableCell>
                    <TableCell className="font-mono text-xs">{p.transactionReference}</TableCell>
                    <TableCell className="font-bold text-emerald-600">
                      {formatCurrency(p.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge status={p.paymentStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <RecordPaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          defaultInvoiceId={invoice._id}
          invoiceBalance={invoice.balance}
          invoiceNumber={invoice.invoiceNumber}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}

