'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ICustomer } from '@/types';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Building,
  Mail,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { CustomerModal } from './CustomerModal';

export function CustomerTable() {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search.trim(),
      });
      const res = await fetch(`/api/customers?${params}`);
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.total);
      }
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete or archive ${name}? Safe deletion prevents data loss if active records exist.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || 'Customer record archived successfully');
        fetchCustomers();
      } else {
        toast.error(json.error || 'Failed to archive customer');
      }
    } catch {
      toast.error('Error deleting customer');
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, company..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <Button
          onClick={() => {
            setSelectedCustomer(null);
            setModalOpen(true);
          }}
          variant="primary"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Customer
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
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<UserCheck className="w-6 h-6 text-indigo-500" />}
            title="No Customers Found"
            description={
              search ? 'No customer matches your search criteria.' : 'Start by adding your first customer account.'
            }
            actionLabel="Create Customer"
            onAction={() => {
              setSelectedCustomer(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Active Subs</TableHead>
                  <TableHead>Total Invoices</TableHead>
                  <TableHead>Lifetime Spent</TableHead>
                  <TableHead>Unpaid</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>
                      <Link
                        href={`/customers/${c._id}`}
                        className="group flex flex-col font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <span className="font-semibold">{c.fullName}</span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-indigo-500">
                          <Mail className="w-3 h-3" />
                          {c.email}
                        </span>
                      </Link>
                    </TableCell>

                    <TableCell>
                      {c.companyName ? (
                        <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {c.companyName}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge variant={c.activeSubscriptionsCount ? 'success' : 'neutral'}>
                        {c.activeSubscriptionsCount || 0} active
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {c.invoicesCount || 0}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {formatCurrency(c.totalSpent)}
                      </span>
                    </TableCell>

                    <TableCell>
                      {c.unpaidBalance && c.unpaidBalance > 0 ? (
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                          {formatCurrency(c.unpaidBalance)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">$0.00</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-slate-500">
                        {formatDate(c.createdAt, 'MMM dd, yyyy')}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/customers/${c._id}`}>
                          <Button variant="ghost" size="icon" title="View Details">
                            <Eye className="w-4 h-4 text-slate-500" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Customer"
                          onClick={() => {
                            setSelectedCustomer(c);
                            setModalOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete / Archive"
                          onClick={() => handleDelete(c._id, c.fullName)}
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
        <CustomerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          customer={selectedCustomer}
          onSaved={fetchCustomers}
        />
      )}
    </div>
  );
}

