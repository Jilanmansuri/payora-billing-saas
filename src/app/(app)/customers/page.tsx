'use client';

import React from 'react';
import { CustomerTable } from '@/components/customers/CustomerTable';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Customer Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your accounts, review lifetime spending, and inspect subscription health.
        </p>
      </div>

      <CustomerTable />
    </div>
  );
}

