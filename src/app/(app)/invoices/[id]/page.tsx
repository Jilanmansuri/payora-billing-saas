'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { InvoiceDetailView } from '@/components/invoices/InvoiceDetailView';
import { IInvoice, IPayment, IBusinessSettings } from '@/types';
import { toast } from 'sonner';

function InvoiceDetailContent({ id }: { id: string }) {
  const [invoice, setInvoice] = useState<
    (IInvoice & { payments?: IPayment[]; businessSettings?: IBusinessSettings | null }) | null
  >(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setInvoice(json.data);
      } else {
        toast.error('Invoice not found');
      }
    } catch {
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        Invoice not found or deleted.
      </div>
    );
  }

  return <InvoiceDetailView invoice={invoice} onRefresh={fetchInvoice} />;
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense fallback={<div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />}>
      <InvoiceDetailContent id={id} />
    </Suspense>
  );
}
