'use client';

import React from 'react';
import { ProductCatalog } from '@/components/products/ProductCatalog';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Products &amp; Pricing Plans
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Define core software packages, recurring subscription tiers, and one-time fees.
        </p>
      </div>

      <ProductCatalog />
    </div>
  );
}

