'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { SubscriptionDetailView } from '@/components/subscriptions/SubscriptionDetailView';
import { ISubscription, IInvoice } from '@/types';
import { toast } from 'sonner';

function SubscriptionDetailContent({ id }: { id: string }) {
  const [subscription, setSubscription] = useState<(ISubscription & { invoices?: IInvoice[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      const res = await fetch(`/api/subscriptions/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSubscription(json.data);
      } else {
        toast.error('Subscription not found');
      }
    } catch {
      toast.error('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-72 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        Subscription record not found.
      </div>
    );
  }

  return (
    <SubscriptionDetailView
      subscription={subscription}
      onRefresh={fetchSubscription}
    />
  );
}

export default function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense fallback={<div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />}>
      <SubscriptionDetailContent id={id} />
    </Suspense>
  );
}
