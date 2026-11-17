'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, Landmark, QrCode, Banknote, ArrowRight } from 'lucide-react';
import { IPayment } from '@/types';

export function RecentPaymentsList() {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/payments?limit=5');
        const json = await res.json();
        if (json.success && json.data) {
          setPayments(json.data);
        }
      } catch (err) {
        console.error('Failed to load recent payments:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <Landmark className="w-4 h-4 text-slate-500" />;
      case 'upi':
        return <QrCode className="w-4 h-4 text-purple-500" />;
      case 'cash':
        return <Banknote className="w-4 h-4 text-emerald-500" />;
      case 'card':
      default:
        return <CreditCard className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <Card className="col-span-full lg:col-span-6">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest simulated customer settlements</CardDescription>
        </div>
        <Link
          href="/payments"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No payment transactions recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {payments.map((p) => {
              const cust = p.customerId as unknown as { fullName?: string; email?: string };
              const inv = p.invoiceId as unknown as { invoiceNumber?: string };
              return (
                <div key={p._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getMethodIcon(p.paymentMethod)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {cust?.fullName || 'Customer'}
                      </p>
                      <p className="text-slate-400 text-[11px] truncate">
                        {inv?.invoiceNumber || p.paymentId} &bull; {formatDate(p.paymentDate, 'MMM dd')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(p.amount)}
                    </span>
                    <Badge status={p.paymentStatus} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

