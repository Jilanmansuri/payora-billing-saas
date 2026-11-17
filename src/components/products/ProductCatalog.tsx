'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils';
import { IProduct, IPricingPlan } from '@/types';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  Search,
  Layers,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { ProductModal } from './ProductModal';
import { PlanModal } from './PlanModal';

export function ProductCatalog() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<IPricingPlan | null>(null);
  const [targetProductId, setTargetProductId] = useState<string>('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    return true;
  });

  const handleArchiveProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive product "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Product archived');
        fetchProducts();
      } else {
        toast.error(json.error || 'Failed to archive');
      }
    } catch {
      toast.error('Error archiving product');
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate or remove plan "${name}"?`)) return;
    try {
      const res = await fetch(`/api/plans/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message || 'Plan removed');
        fetchProducts();
      } else {
        toast.error(json.error || 'Failed to delete plan');
      }
    } catch {
      toast.error('Error deleting plan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Pills */}
          <div className="hidden md:flex items-center gap-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            onClick={() => {
              setSelectedProduct(null);
              setProductModalOpen(true);
            }}
            variant="primary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="w-6 h-6 text-indigo-500" />}
          title="No Products Found"
          description="Create your first SaaS product catalog entry to get started."
          actionLabel="Create Product"
          onAction={() => {
            setSelectedProduct(null);
            setProductModalOpen(true);
          }}
        />
      ) : (
        <div className="space-y-6">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <CardHeader className="bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <Badge variant="neutral">{product.category}</Badge>
                      {product.status === 'archived' && <Badge status="archived">Archived</Badge>}
                    </div>
                    {product.description && (
                      <CardDescription className="text-xs mt-1">
                        {product.description}
                      </CardDescription>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTargetProductId(product._id);
                      setSelectedPlan(null);
                      setPlanModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Plan Tier
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Edit Product"
                    onClick={() => {
                      setSelectedProduct(product);
                      setProductModalOpen(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Archive Product"
                    onClick={() => handleArchiveProduct(product._id, product.name)}
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {!product.plans || product.plans.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                    No pricing tiers defined yet for this product.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {product.plans.map((plan) => (
                      <div
                        key={plan._id}
                        className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                          plan.isActive
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-xs'
                            : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                {plan.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 capitalize">
                                {plan.billingInterval} billing
                              </p>
                            </div>
                            <Badge variant={plan.isActive ? 'success' : 'neutral'}>
                              {plan.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>

                          <div className="mt-4 mb-2 flex items-baseline gap-1">
                            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                              {formatCurrency(plan.amount, plan.currency)}
                            </span>
                            <span className="text-xs text-slate-400">
                              {plan.billingInterval === 'one-time'
                                ? 'one-time fee'
                                : `/ ${plan.billingInterval}`}
                            </span>
                          </div>

                          {plan.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                              {plan.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          <button
                            onClick={() => {
                              setSelectedPlan(plan);
                              setTargetProductId(product._id);
                              setPlanModalOpen(true);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                          >
                            Edit Tier
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan._id, plan.name)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product modal */}
      {productModalOpen && (
        <ProductModal
          isOpen={productModalOpen}
          onClose={() => setProductModalOpen(false)}
          product={selectedProduct}
          onSaved={fetchProducts}
        />
      )}

      {/* Plan modal */}
      {planModalOpen && (
        <PlanModal
          isOpen={planModalOpen}
          onClose={() => setPlanModalOpen(false)}
          products={products}
          selectedProductId={targetProductId}
          plan={selectedPlan}
          onSaved={fetchProducts}
        />
      )}
    </div>
  );
}

