'use client';

import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/utils';
import { IDashboardStats } from '@/types';
import {
  DollarSign,
  TrendingUp,
  Repeat,
  Users,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export function DashboardKPIs({ stats }: { stats: IDashboardStats | null }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue.value)}
        changePercentage={stats.totalRevenue.changePercentage}
        comparisonLabel="vs last month"
        icon={<DollarSign className="w-5 h-5" />}
        iconColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
      />

      <StatCard
        title="MRR"
        value={formatCurrency(stats.mrr.value)}
        changePercentage={stats.mrr.changePercentage}
        comparisonLabel="growth"
        icon={<TrendingUp className="w-5 h-5" />}
        iconColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
      />

      <StatCard
        title="Active Subs"
        value={stats.activeSubscriptions.value}
        changePercentage={stats.activeSubscriptions.changePercentage}
        comparisonLabel="vs last month"
        icon={<Repeat className="w-5 h-5" />}
        iconColor="bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
      />

      <StatCard
        title="Total Customers"
        value={stats.totalCustomers.value}
        changePercentage={stats.totalCustomers.changePercentage}
        comparisonLabel="vs last month"
        icon={<Users className="w-5 h-5" />}
        iconColor="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
      />

      <StatCard
        title="Pending Invoices"
        value={formatCurrency(stats.pendingInvoices.amount)}
        comparisonLabel={`${stats.pendingInvoices.value} invoices`}
        icon={<Clock className="w-5 h-5" />}
        iconColor="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
      />

      <StatCard
        title="Overdue Invoices"
        value={formatCurrency(stats.overdueInvoices.amount)}
        comparisonLabel={`${stats.overdueInvoices.value} overdue`}
        icon={<AlertTriangle className="w-5 h-5" />}
        iconColor="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
      />
    </div>
  );
}

