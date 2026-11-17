'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { ISubscription } from '@/types';

export function UpcomingRenewalsList() {
  const [renewals, setRenewals] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard/upcoming-renewals?limit=5');
        const json = await res.json();
        if (json.success && json.data) {
          setRenewals(json.data);
        }
      } catch (err) {
        console.error('Failed to load upcoming renewals:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Card className="col-span-full lg:col-span-6">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>Upcoming Renewals</CardTitle>
          <CardDescription>Scheduled subscription renewal dates</CardDescription>
        </div>
        <Link
          href="/subscriptions"
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
        ) : renewals.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No upcoming renewals found.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {renewals.map((sub) => {
              const cust = sub.customerId as unknown as { fullName?: string };
              const plan = sub.pricingPlanId as unknown as { name?: string };
              return (
                <div key={sub._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {cust?.fullName || 'Customer'}
                      </p>
                      <p className="text-slate-400 text-[11px] truncate">
                        {plan?.name || 'Subscription'} &bull; {sub.billingInterval}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(sub.amount, sub.currency)}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(sub.nextBillingDate, 'MMM dd, yyyy')}
                    </span>
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

