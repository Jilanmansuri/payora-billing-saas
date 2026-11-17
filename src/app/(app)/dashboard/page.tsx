'use client';

import React, { useEffect, useState } from 'react';
import { DashboardKPIs } from '@/components/dashboard/DashboardKPIs';
import { RevenueAreaChart } from '@/components/dashboard/RevenueAreaChart';
import { SubscriptionDistributionChart } from '@/components/dashboard/SubscriptionDistributionChart';
import { RecentPaymentsList } from '@/components/dashboard/RecentPaymentsList';
import { UpcomingRenewalsList } from '@/components/dashboard/UpcomingRenewalsList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { IDashboardStats } from '@/types';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
        toast.error('Failed to load live dashboard statistics');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key business metrics, monthly recurring revenue, and subscription health.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <DashboardKPIs stats={stats} />
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <RevenueAreaChart />
        <SubscriptionDistributionChart />
      </div>

      {/* Operational Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <RecentPaymentsList />
        <UpcomingRenewalsList />
      </div>

      {/* Activity Timeline */}
      <ActivityFeed />
    </div>
  );
}

