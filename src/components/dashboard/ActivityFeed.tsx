'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import {
  UserPlus,
  Zap,
  FileCheck,
  CreditCard,
  PauseCircle,
  PlayCircle,
  XCircle,
  Activity as ActivityIcon,
} from 'lucide-react';
import { IActivity } from '@/types';

export function ActivityFeed() {
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard/recent-activity?limit=6');
        const json = await res.json();
        if (json.success && json.data) {
          setActivities(json.data);
        }
      } catch (err) {
        console.error('Failed to load activity feed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'customer_created':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'subscription_created':
      case 'subscription_changed':
        return <Zap className="w-4 h-4 text-indigo-500" />;
      case 'subscription_paused':
        return <PauseCircle className="w-4 h-4 text-amber-500" />;
      case 'subscription_resumed':
        return <PlayCircle className="w-4 h-4 text-emerald-500" />;
      case 'subscription_cancelled':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'invoice_generated':
        return <FileCheck className="w-4 h-4 text-teal-500" />;
      case 'payment_recorded':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Activity Stream</CardTitle>
        <CardDescription>Real-time audit log of billing events and lifecycle actions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No recent activities logged.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {activities.map((act) => (
              <div key={act._id} className="relative flex items-start justify-between gap-4 text-xs">
                {/* Icon bullet */}
                <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0">{getActivityIcon(act.type)}</span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{act.title}</p>
                  </div>
                  <p className="text-slate-500 pl-6">{act.description}</p>
                </div>

                <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                  {formatDate(act.createdAt, 'MMM dd, h:mm a')}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

