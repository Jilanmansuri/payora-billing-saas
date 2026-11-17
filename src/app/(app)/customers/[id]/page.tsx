'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { CustomerDetailView } from '@/components/customers/CustomerDetailView';
import { ICustomer, ISubscription, IInvoice, IPayment } from '@/types';
import { toast } from 'sonner';

function CustomerDetailContent({ id }: { id: string }) {
  const [customer, setCustomer] = useState<
    (ICustomer & { subscriptions?: ISubscription[]; invoices?: IInvoice[]; payments?: IPayment[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCustomer(json.data);
      } else {
        toast.error('Customer not found');
      }
    } catch {
      toast.error('Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Customer not found or has been deleted.
      </div>
    );
  }

  return <CustomerDetailView customer={customer} onRefresh={fetchCustomer} />;
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense fallback={<div className="h-64 rounded-xl bg-slate-100 animate-pulse" />}>
      <CustomerDetailContent id={id} />
    </Suspense>
  );
}
