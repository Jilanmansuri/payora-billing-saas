'use client';

import React from 'react';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Invoice Management
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate, review, settle, and export itemized billing invoices for customers.
        </p>
      </div>

      <InvoiceTable />
    </div>
  );
}

