'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ICustomer, ISubscription, IInvoice, IPayment } from '@/types';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  Repeat,
  FileText,
  CreditCard,
  Edit2,
  Trash2,
  Plus,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { CustomerModal } from './CustomerModal';

interface CustomerDetailViewProps {
  customer: ICustomer & {
    subscriptions?: ISubscription[];
    invoices?: IInvoice[];
    payments?: IPayment[];
  };
  onRefresh: () => void;
}

export function CustomerDetailView({ customer, onRefresh }: CustomerDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [editModalOpen, setEditModalOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'subscriptions', label: 'Subscriptions', count: customer.subscriptions?.length || 0 },
    { id: 'invoices', label: 'Invoices', count: customer.invoices?.length || 0 },
    { id: 'payments', label: 'Payments', count: customer.payments?.length || 0 },
  ];

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete or archive ${customer.fullName}?`)) return;
    try {
      const res = await fetch(`/api/customers/${customer._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || 'Customer archived');
        router.push('/customers');
      } else {
        toast.error(json.error || 'Failed to archive customer');
      }
    } catch {
      toast.error('Error during deletion');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/customers">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {customer.fullName}
              </h1>
              {customer.isArchived && <Badge status="archived">Archived</Badge>}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Client ID: <span className="font-mono">{customer._id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
            <Edit2 className="w-4 h-4 mr-1.5" />
            Edit Profile
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1.5" />
            Archive
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Spent</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {formatCurrency(customer.totalSpent)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across all settled invoices</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Active Subs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {customer.activeSubscriptionsCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Ongoing billing plans</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Invoices</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {customer.invoicesCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Total billing records</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Unpaid Balance</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(customer.unpaidBalance)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Pending and overdue total</p>
        </Card>
      </div>

      {/* Tabs navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <a href={`mailto:${customer.email}`} className="text-indigo-600 font-medium">
                    {customer.email}
                  </a>
                </div>
              </div>

              {customer.phoneNumber && (
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone</span>
                    <span className="text-slate-800 dark:text-slate-200">{customer.phoneNumber}</span>
                  </div>
                </div>
              )}

              {customer.companyName && (
                <div className="flex items-start gap-2.5">
                  <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Company</span>
                    <span className="text-slate-800 dark:text-slate-200">{customer.companyName}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Billing Address</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {customer.billingAddress || 'No street address provided'}
                    <br />
                    {[customer.city, customer.state, customer.postalCode].filter(Boolean).join(', ')}
                    <br />
                    {customer.country}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Account Created</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {formatDate(customer.createdAt, 'MMMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Subscriptions</CardTitle>
              <Link href={`/subscriptions/new?customerId=${customer._id}`}>
                <Button variant="outline" size="sm">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  New Subscription
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!customer.subscriptions || customer.subscriptions.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No subscriptions active for this customer.</p>
              ) : (
                <div className="space-y-3">
                  {customer.subscriptions.map((sub) => {
                    const prod = sub.productId as unknown as { name?: string };
                    const plan = sub.pricingPlanId as unknown as { name?: string };
                    return (
                      <div
                        key={sub._id}
                        className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {prod?.name || 'Product'} &bull; {plan?.name || 'Plan'}
                            </span>
                            <Badge status={sub.status} />
                          </div>
                          <p className="text-slate-400 mt-1">
                            {formatCurrency(sub.amount, sub.currency)} / {sub.billingInterval} &bull; Next billing:{' '}
                            {formatDate(sub.nextBillingDate)}
                          </p>
                        </div>
                        <Link href={`/subscriptions/${sub._id}`}>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Subscription Plans</CardTitle>
            <Link href={`/subscriptions/new?customerId=${customer._id}`}>
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Subscription
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!customer.subscriptions || customer.subscriptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No subscriptions found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subscription ID</TableHead>
                    <TableHead>Product & Plan</TableHead>
                    <TableHead>Interval</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.subscriptions.map((s) => {
                    const prod = s.productId as unknown as { name?: string };
                    const plan = s.pricingPlanId as unknown as { name?: string };
                    return (
                      <TableRow key={s._id}>
                        <TableCell className="font-mono font-medium">{s.subscriptionId}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {prod?.name}
                          </span>
                          <span className="block text-[11px] text-slate-400">{plan?.name}</span>
                        </TableCell>
                        <TableCell className="capitalize">{s.billingInterval}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(s.amount, s.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge status={s.status} />
                        </TableCell>
                        <TableCell>{formatDate(s.nextBillingDate)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/subscriptions/${s._id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'invoices' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Invoices</CardTitle>
            <Link href={`/invoices/new?customerId=${customer._id}`}>
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Invoice
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!customer.invoices || customer.invoices.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No invoices generated for this customer.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.invoices.map((inv) => (
                    <TableRow key={inv._id}>
                      <TableCell className="font-mono font-semibold">{inv.invoiceNumber}</TableCell>
                      <TableCell>{formatDate(inv.issueDate)}</TableCell>
                      <TableCell>{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(inv.totalAmount)}</TableCell>
                      <TableCell className="text-emerald-600">{formatCurrency(inv.paidAmount)}</TableCell>
                      <TableCell className="font-semibold text-rose-600">
                        {formatCurrency(inv.balance)}
                      </TableCell>
                      <TableCell>
                        <Badge status={inv.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/invoices/${inv._id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {!customer.payments || customer.payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No payments logged for this customer.</p>
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
                  {customer.payments.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-mono font-semibold">{p.paymentId}</TableCell>
                      <TableCell>{formatDate(p.paymentDate, 'MMM dd, yyyy h:mm a')}</TableCell>
                      <TableCell className="capitalize">{p.paymentMethod.replace('_', ' ')}</TableCell>
                      <TableCell className="font-mono text-xs">{p.transactionReference}</TableCell>
                      <TableCell className="font-bold text-slate-900 dark:text-slate-100">
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
      )}

      {editModalOpen && (
        <CustomerModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          customer={customer}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}

