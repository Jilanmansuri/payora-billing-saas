'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function RevenueAreaChart() {
  const [months, setMonths] = useState<number>(6);
  const [data, setData] = useState<{ month: string; revenue: number; count: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/revenue?months=${months}`);
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setData(json.data.monthlyRevenue || []);
        }
      } catch (err) {
        console.error('Failed to load revenue chart:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [months]);

  return (
    <Card className="col-span-full xl:col-span-8">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <CardDescription>Historical gross revenue from collected payments</CardDescription>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setMonths(3)}
            className={`px-2.5 py-1 rounded-md transition-all ${
              months === 3
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            3M
          </button>
          <button
            onClick={() => setMonths(6)}
            className={`px-2.5 py-1 rounded-md transition-all ${
              months === 6
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            6M
          </button>
          <button
            onClick={() => setMonths(12)}
            className={`px-2.5 py-1 rounded-md transition-all ${
              months === 12
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            12M
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full pt-2">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-slate-400 animate-pulse">
              Loading revenue metrics...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  formatter={(val: unknown) => [formatCurrency(Number(val) || 0), 'Revenue']}
                  labelStyle={{ fontWeight: 600, color: '#1e293b' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

