'use client';

import React from 'react';
import { PaymentTable } from '@/components/payments/PaymentTable';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Payment Transactions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Simulated incoming revenue settlements, partial balance payments, and transaction auditing.
        </p>
      </div>

      <PaymentTable />
    </div>
  );
}

