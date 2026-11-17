'use client';

import React from 'react';
import { SubscriptionTable } from '@/components/subscriptions/SubscriptionTable';

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Subscription Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitor recurring subscriber accounts, manage pauses, upgrades, and simulate billing renewals.
        </p>
      </div>

      <SubscriptionTable />
    </div>
  );
}

