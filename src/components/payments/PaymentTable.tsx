'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IPayment } from '@/types';
import {
  Search,
  Plus,
  CreditCard,
  Landmark,
  QrCode,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { RecordPaymentModal } from './RecordPaymentModal';

export function PaymentTable() {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [method, setMethod] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search.trim(),
        paymentMethod: method,
        paymentStatus: status,
      });

      const res = await fetch(`/api/payments?${params}`);
      const json = await res.json();
      if (json.success) {
        setPayments(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.total);
      }
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [page, search, method, status]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPayments();
  };

  const getMethodIcon = (m: string) => {
    switch (m) {
      case 'bank_transfer':
        return <Landmark className="w-3.5 h-3.5 text-slate-500" />;
      case 'upi':
        return <QrCode className="w-3.5 h-3.5 text-purple-500" />;
      case 'cash':
        return <Banknote className="w-3.5 h-3.5 text-emerald-500" />;
      case 'card':
      default:
        return <CreditCard className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, customer..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </form>

          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              setPage(1);
            }}
            className="text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Methods</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <Button onClick={() => setModalOpen(true)} variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Record Payment
        </Button>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-6 h-6 text-indigo-500" />}
            title="No Payment Records Found"
            description="Record incoming invoice payments to maintain cash flow tracking."
            actionLabel="Record Payment"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction Ref</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const cust = p.customerId as unknown as { _id?: string; fullName?: string; email?: string };
                  const inv = p.invoiceId as unknown as { _id?: string; invoiceNumber?: string };

                  return (
                    <TableRow key={p._id}>
                      <TableCell className="font-mono font-semibold text-slate-900 dark:text-slate-100 text-xs">
                        {p.paymentId}
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
                        {inv ? (
                          <Link
                            href={`/invoices/${inv._id}`}
                            className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs capitalize text-slate-700 dark:text-slate-300">
                          {getMethodIcon(p.paymentMethod)}
                          {p.paymentMethod.replace('_', ' ')}
                        </span>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-slate-500">
                        {p.transactionReference}
                      </TableCell>

                      <TableCell className="text-xs text-slate-500">
                        {formatDate(p.paymentDate, 'MMM dd, yyyy h:mm a')}
                      </TableCell>

                      <TableCell className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {formatCurrency(p.amount)}
                      </TableCell>

                      <TableCell className="text-right">
                        <Badge status={p.paymentStatus} />
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
        <RecordPaymentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={fetchPayments}
        />
      )}
    </div>
  );
}

