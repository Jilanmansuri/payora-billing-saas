'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IInvoice } from '@/types';
import {
  Search,
  Plus,
  FileText,
  Download,
  Eye,
  Trash2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { generateInvoicePDF } from './InvoicePDF';

export function InvoiceTable() {
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search.trim(),
        status,
      });

      const res = await fetch(`/api/invoices?${params}`);
      const json = await res.json();
      if (json.success) {
        setInvoices(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.total);
      }
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInvoices();
  };

  const handleDelete = async (id: string, number: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${number}?`)) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Invoice deleted');
        fetchInvoices();
      } else {
        toast.error(json.error || 'Failed to delete');
      }
    } catch {
      toast.error('Error deleting invoice');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice # or customer..."
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
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <Link href="/invoices/new">
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-6 h-6 text-indigo-500" />}
            title="No Invoices Found"
            description="Create custom invoices or generate renewals from active subscriptions."
            actionLabel="Create Invoice"
            onAction={() => window.location.assign('/invoices/new')}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const cust = inv.customerId as unknown as { _id?: string; fullName?: string; email?: string };

                  return (
                    <TableRow key={inv._id}>
                      <TableCell>
                        <Link
                          href={`/invoices/${inv._id}`}
                          className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {inv.invoiceNumber}
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

                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        {formatDate(inv.issueDate)}
                      </TableCell>

                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(inv.dueDate)}
                        </span>
                      </TableCell>

                      <TableCell className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {formatCurrency(inv.totalAmount, inv.currency)}
                      </TableCell>

                      <TableCell className="text-xs text-emerald-600 font-medium">
                        {formatCurrency(inv.paidAmount, inv.currency)}
                      </TableCell>

                      <TableCell>
                        {inv.balance > 0 ? (
                          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                            {formatCurrency(inv.balance, inv.currency)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">$0.00</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge status={inv.status} />
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/invoices/${inv._id}`}>
                            <Button variant="ghost" size="icon" title="View Details">
                              <Eye className="w-4 h-4 text-slate-500" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download PDF"
                            onClick={() => generateInvoicePDF(inv)}
                          >
                            <Download className="w-4 h-4 text-slate-500" />
                          </Button>
                          {inv.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete Draft"
                              onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                            >
                              <Trash2 className="w-4 h-4 text-rose-500" />
                            </Button>
                          )}
                        </div>
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
    </div>
  );
}

