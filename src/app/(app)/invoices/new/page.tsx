'use client';

import React, { Suspense } from 'react';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading invoice builder...</div>}>
      <InvoiceForm />
    </Suspense>
  );
}

