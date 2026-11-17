'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export function AnalyticsOverview() {
  const [range, setRange] = useState<'7d' | '30d' | '3m' | '6m' | '12m' | 'all'>('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    metrics: {
      totalRevenue: number;
      mrr: number;
      yearlyRunRate: number;
      arpu: number;
      activeSubscriptionsCount: number;
      customerCount: number;
      paymentSuccessRate: number;
      outstandingAmount: number;
    };
    revenueTrend: { date: string; revenue: number; count: number }[];
    paymentMethods: { method: string; revenue: number; count: number }[];
    paymentStatuses: { status: string; count: number }[];
    invoiceStatuses: { status: string; count: number; amount: number }[];
    revenueByInterval: { interval: string; totalAnnualized: number; count: number }[];
    revenueByProduct: { name: string; value: number }[];
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/overview?range=${range}`);
        const json = await res.json();
        if (isMounted && json.success) {
          setData(json.data);
        }
      } catch {
        toast.error('Failed to load analytics metrics');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [range]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Date Range Selector Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Financial & SaaS Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time business performance derived directly from database transactions.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-medium shadow-xs">
          {[
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: '3m', label: '3 Months' },
            { id: '6m', label: '6 Months' },
            { id: '12m', label: '12 Months' },
            { id: 'all', label: 'All Time' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id as typeof range)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                range === item.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Collected Revenue"
            value={formatCurrency(data.metrics.totalRevenue)}
            comparisonLabel={`for ${range}`}
            icon={<DollarSign className="w-5 h-5" />}
            iconColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          />

          <StatCard
            title="MRR"
            value={formatCurrency(data.metrics.mrr)}
            comparisonLabel="normalized monthly"
            icon={<TrendingUp className="w-5 h-5" />}
            iconColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
          />

          <StatCard
            title="Annual Run Rate (ARR)"
            value={formatCurrency(data.metrics.yearlyRunRate)}
            comparisonLabel="MRR × 12"
            icon={<Layers className="w-5 h-5" />}
            iconColor="bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
          />

          <StatCard
            title="ARPU"
            value={formatCurrency(data.metrics.arpu)}
            comparisonLabel="revenue / customer"
            icon={<Users className="w-5 h-5" />}
            iconColor="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
          />

          <StatCard
            title="Success Rate"
            value={`${data.metrics.paymentSuccessRate}%`}
            comparisonLabel="payment settlement"
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconColor="bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400"
          />

          <StatCard
            title="Outstanding Balance"
            value={formatCurrency(data.metrics.outstandingAmount)}
            comparisonLabel="pending / overdue"
            icon={<AlertCircle className="w-5 h-5" />}
            iconColor="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
          />
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Trend Area Chart */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Daily Revenue Trajectory</CardTitle>
            <CardDescription>Collected volume over selected interval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full pt-2">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-slate-400 animate-pulse">
                  Loading revenue trajectory...
                </div>
              ) : !data || data.revenueTrend.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                  No transaction data available for this range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#analyticsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Product Breakdown */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>MRR by Product</CardTitle>
            <CardDescription>Monthly recurring revenue contribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full pt-2">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-slate-400 animate-pulse">
                  Loading product breakdown...
                </div>
              ) : !data || data.revenueByProduct.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                  No active product subscriptions.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.revenueByProduct}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: '#334155' }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'MRR']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {data.revenueByProduct.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Distribution Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Volume distribution by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-slate-400 animate-pulse">
                  Loading...
                </div>
              ) : !data || data.paymentMethods.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                  No method data.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.paymentMethods}
                      dataKey="revenue"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {data.paymentMethods.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Statuses</CardTitle>
            <CardDescription>Breakdown by invoice state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-slate-400 animate-pulse">
                  Loading...
                </div>
              ) : !data || data.invoiceStatuses.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                  No invoice data.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.invoiceStatuses} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(val: unknown) => [Number(val) || 0, 'Invoices']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Interval */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Intervals</CardTitle>
            <CardDescription>Annualized run rate by cadence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-slate-400 animate-pulse">
                  Loading...
                </div>
              ) : !data || data.revenueByInterval.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                  No subscription intervals.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.revenueByInterval}
                      dataKey="totalAnnualized"
                      nameKey="interval"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name }) => name}
                    >
                      {data.revenueByInterval.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'Annualized']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

