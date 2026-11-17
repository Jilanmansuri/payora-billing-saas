'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export function SubscriptionDistributionChart() {
  const [data, setData] = useState<{ status: string; count: number; color: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await fetch('/api/dashboard/revenue?months=1');
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setData(json.data.subscriptionOverview || []);
        }
      } catch (err) {
        console.error('Failed to load subscription distribution:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSubscriptions = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="col-span-full xl:col-span-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Subscriptions</CardTitle>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Total: {totalSubscriptions}
          </span>
        </div>
        <CardDescription>Status breakdown across active accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full pt-2">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-slate-400 animate-pulse">
              Loading distribution...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis
                  dataKey="status"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }}
                  width={70}
                />
                <Tooltip
                  formatter={(val: unknown) => [Number(val) || 0, 'Subscriptions']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

