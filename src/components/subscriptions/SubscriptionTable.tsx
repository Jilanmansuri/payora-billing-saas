'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ISubscription } from '@/types';
import {
  Search,
  Plus,
  Repeat,
  Calendar,
  Eye,
  CheckCircle,
  PauseCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { SubscriptionModal } from './SubscriptionModal';

export function SubscriptionTable() {
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [interval, setInterval] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search.trim(),
        status,
        billingInterval: interval,
      });

      const res = await fetch(`/api/subscriptions?${params}`);
      const json = await res.json();
      if (json.success) {
        setSubscriptions(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.total);
      }
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, interval]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubscriptions();
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, ID, product..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="past_due">Past Due</option>
          </select>

          <select
            value={interval}
            onChange={(e) => {
              setInterval(e.target.value);
              setPage(1);
            }}
            className="text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Intervals</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="one-time">One-time</option>
          </select>
        </div>

        <Button onClick={() => setModalOpen(true)} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Create Subscription
        </Button>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <EmptyState
            icon={<Repeat className="w-6 h-6 text-indigo-500" />}
            title="No Subscriptions Found"
            description="Create recurring subscriptions for your customers to automate billing."
            actionLabel="Create Subscription"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product & Plan</TableHead>
                  <TableHead>Billing Interval</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => {
                  const cust = sub.customerId as unknown as { _id?: string; fullName?: string; email?: string };
                  const prod = sub.productId as unknown as { name?: string };
                  const plan = sub.pricingPlanId as unknown as { name?: string };

                  return (
                    <TableRow key={sub._id}>
                      <TableCell>
                        <Link
                          href={`/subscriptions/${sub._id}`}
                          className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {sub.subscriptionId}
                        </Link>
                      </TableCell>

                      <TableCell>
                        {cust ? (
                          <Link
                            href={`/customers/${cust._id}`}
                            className="text-slate-900 dark:text-slate-100 hover:text-indigo-600 font-medium text-xs block"
                          >
                            <span>{cust.fullName}</span>
                            <span className="block text-[11px] text-slate-400">{cust.email}</span>
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {prod?.name || 'Product'}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {plan?.name || 'Plan Tier'}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="capitalize text-xs font-medium text-slate-600 dark:text-slate-300">
                          {sub.billingInterval}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {formatCurrency(sub.amount, sub.currency)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge status={sub.status} />
                      </TableCell>

                      <TableCell>
                        {sub.status === 'cancelled' ? (
                          <span className="text-xs text-slate-400">Cancelled</span>
                        ) : sub.nextBillingDate ? (
                          <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDate(sub.nextBillingDate)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Link href={`/subscriptions/${sub._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Manage
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {modalOpen && (
        <SubscriptionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={fetchSubscriptions}
        />
      )}
    </div>
  );
}

