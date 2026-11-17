'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ISubscription, IInvoice, IPricingPlan } from '@/types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  PlayCircle,
  PauseCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  FileText,
  User,
  Package,
  Layers,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionDetailViewProps {
  subscription: ISubscription & {
    invoices?: IInvoice[];
  };
  onRefresh: () => void;
}

export function SubscriptionDetailView({ subscription, onRefresh }: SubscriptionDetailViewProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [changePlanModalOpen, setChangePlanModalOpen] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<IPricingPlan[]>([]);
  const [newPlanId, setNewPlanId] = useState('');
  const [changePlanNotes, setChangePlanNotes] = useState('');

  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseNotes, setPauseNotes] = useState('');

  const cust = subscription.customerId as unknown as { _id?: string; fullName?: string; email?: string };
  const prod = subscription.productId as unknown as { _id?: string; name?: string };
  const plan = subscription.pricingPlanId as unknown as { _id?: string; name?: string; amount?: number; currency?: string };

  const handlePause = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscription._id}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: pauseNotes }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Subscription paused successfully');
        setPauseModalOpen(false);
        onRefresh();
      } else {
        toast.error(json.error || 'Failed to pause');
      }
    } catch {
      toast.error('Error pausing subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscription._id}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Subscription resumed! Billing schedule updated.');
        onRefresh();
      } else {
        toast.error(json.error || 'Failed to resume');
      }
    } catch {
      toast.error('Error resuming subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this subscription? Cancelled subscriptions cannot be resumed.')) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscription._id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Subscription has been cancelled');
        onRefresh();
      } else {
        toast.error(json.error || 'Failed to cancel');
      }
    } catch {
      toast.error('Error cancelling subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateRenewal = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscription._id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Simulated renewal successful! New Invoice generated: ${json.invoice?.invoiceNumber}`);
        onRefresh();
      } else {
        toast.error(json.error || 'Failed to renew');
      }
    } catch {
      toast.error('Error simulating renewal');
    } finally {
      setActionLoading(false);
    }
  };

  const openChangePlanModal = async () => {
    try {
      const res = await fetch(`/api/plans?productId=${prod._id}&isActive=true`);
      const json = await res.json();
      if (json.success && json.data) {
        setAvailablePlans(json.data);
        if (json.data.length > 0) {
          setNewPlanId(json.data[0]._id);
        }
        setChangePlanModalOpen(true);
      }
    } catch {
      toast.error('Failed to load plans');
    }
  };

  const handleChangePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanId) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscription._id}/change-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPlanId,
          notes: changePlanNotes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Subscription plan changed successfully!');
        setChangePlanModalOpen(false);
        onRefresh();
      } else {
        toast.error(json.error || 'Failed to change plan');
      }
    } catch {
      toast.error('Error changing plan');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/subscriptions">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                {subscription.subscriptionId}
              </h1>
              <Badge status={subscription.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Created on {formatDate(subscription.startDate, 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {subscription.status === 'active' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateRenewal}
                isLoading={actionLoading}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Simulate Renewal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openChangePlanModal}
                disabled={actionLoading}
              >
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                Change Plan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPauseModalOpen(true)}
                disabled={actionLoading}
              >
                <PauseCircle className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Pause
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancel}
                isLoading={actionLoading}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Cancel
              </Button>
            </>
          )}

          {subscription.status === 'paused' && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={handleResume}
                isLoading={actionLoading}
              >
                <PlayCircle className="w-3.5 h-3.5 mr-1" />
                Resume Subscription
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancel}
                isLoading={actionLoading}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Cancel
              </Button>
            </>
          )}

          {subscription.status === 'past_due' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateRenewal}
                isLoading={actionLoading}
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Retry / Renew
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancel}
                isLoading={actionLoading}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Subscription info & invoices */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan & Subscription Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Product Package</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {prod?.name || 'Product'}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Pricing Tier</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {plan?.name || 'Plan'}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Recurring Amount</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">
                    {formatCurrency(subscription.amount, subscription.currency)}
                    <span className="text-xs font-normal text-slate-400">
                      {' '}
                      / {subscription.billingInterval}
                    </span>
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Next Renewal Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : '—'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Associated Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Billing history linked to this subscription</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {!subscription.invoices || subscription.invoices.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No invoices generated yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscription.invoices.map((inv) => (
                      <TableRow key={inv._id}>
                        <TableCell className="font-mono font-medium">{inv.invoiceNumber}</TableCell>
                        <TableCell>{formatDate(inv.issueDate)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(inv.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge status={inv.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/invoices/${inv._id}`}>
                            <Button variant="outline" size="sm">
                              View
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
        </div>

        {/* Right col: Customer Info & Lifecycle Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                  {cust?.fullName?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {cust?.fullName || 'Customer'}
                  </h4>
                  <p className="text-slate-400">{cust?.email}</p>
                </div>
              </div>

              {cust?._id && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link href={`/customers/${cust._id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Customer Profile
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit History Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Subscription History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 text-xs">
                {subscription.history?.map((item, idx) => (
                  <div key={idx} className="relative space-y-0.5">
                    <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                        {item.action}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(item.date, 'MMM dd, yyyy')}
                      </span>
                    </div>
                    {item.notes && <p className="text-slate-600 dark:text-slate-300">{item.notes}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Plan Modal */}
      {changePlanModalOpen && (
        <Modal
          isOpen={changePlanModalOpen}
          onClose={() => setChangePlanModalOpen(false)}
          title="Change Pricing Plan (Upgrade / Downgrade)"
          description="Switch this subscription to another active tier. The new pricing will apply on the next cycle."
          maxWidth="md"
        >
          <form onSubmit={handleChangePlanSubmit} className="space-y-4">
            <Select
              label="Select New Plan *"
              value={newPlanId}
              onChange={(e) => setNewPlanId(e.target.value)}
              options={availablePlans.map((p) => ({
                value: p._id,
                label: `${p.name} - ${formatCurrency(p.amount, p.currency)} (${p.billingInterval})`,
              }))}
              required
            />

            <Textarea
              label="Change Reason / Notes"
              value={changePlanNotes}
              onChange={(e) => setChangePlanNotes(e.target.value)}
              placeholder="e.g. Upgraded to higher capacity volume per client request..."
              rows={3}
            />

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setChangePlanModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={actionLoading}>
                Confirm Plan Change
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Pause Modal */}
      {pauseModalOpen && (
        <Modal
          isOpen={pauseModalOpen}
          onClose={() => setPauseModalOpen(false)}
          title="Pause Subscription"
          description="Temporarily halt renewal billing for this subscription. You can resume at any time."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <Textarea
              label="Reason for Pausing"
              value={pauseNotes}
              onChange={(e) => setPauseNotes(e.target.value)}
              placeholder="e.g. Seasonal pause during client project hiatus"
              rows={3}
            />

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setPauseModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handlePause}
                isLoading={actionLoading}
              >
                Pause Subscription
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

