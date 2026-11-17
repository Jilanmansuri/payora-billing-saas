'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { IProduct } from '@/types';
import { ArrowLeft, Plus } from 'lucide-react';
import { PlanModal } from '@/components/products/PlanModal';

function ProductDetailContent({ id }: { id: string }) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const json = await res.json();
      if (json.success) {
        setProduct(json.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />;
  }

  if (!product) {
    return <div className="py-12 text-center text-sm text-slate-400">Product not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {product.name}
              </h1>
              <Badge variant="neutral">{product.category}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{product.description}</p>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={() => setPlanModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Pricing Tier
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {product.plans?.map((plan) => (
          <Card key={plan._id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {plan.name}
                </h3>
                <Badge variant={plan.isActive ? 'success' : 'neutral'}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(plan.amount, plan.currency)}
                <span className="text-xs font-normal text-slate-400"> / {plan.billingInterval}</span>
              </div>
              {plan.description && (
                <p className="text-xs text-slate-500 mt-2">{plan.description}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {planModalOpen && (
        <PlanModal
          isOpen={planModalOpen}
          onClose={() => setPlanModalOpen(false)}
          products={[product]}
          selectedProductId={product._id}
          onSaved={fetchProduct}
        />
      )}
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense fallback={<div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />}>
      <ProductDetailContent id={id} />
    </Suspense>
  );
}
