'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency, calculateNextBillingDate, formatDate } from '@/lib/utils';
import { ICustomer, IProduct, IPricingPlan } from '@/types';
import { ArrowLeft, Repeat } from 'lucide-react';
import { toast } from 'sonner';

function NewSubscriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCustId = searchParams.get('customerId') || '';

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [plans, setPlans] = useState<IPricingPlan[]>([]);

  const [customerId, setCustomerId] = useState(defaultCustId);
  const [productId, setProductId] = useState('');
  const [pricingPlanId, setPricingPlanId] = useState('');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    setStartDate(new Date().toISOString().split('T')[0]);
    async function loadData() {
      try {
        const [cRes, pRes] = await Promise.all([
          fetch('/api/customers?limit=100'),
          fetch('/api/products'),
        ]);
        const [cJson, pJson] = await Promise.all([cRes.json(), pRes.json()]);

        if (cJson.success) {
          setCustomers(cJson.data);
          if (!customerId && cJson.data.length > 0) {
            setCustomerId(cJson.data[0]._id);
          }
        }
        if (pJson.success && pJson.data.length > 0) {
          setProducts(pJson.data);
          setProductId(pJson.data[0]._id);
          const activePlans = pJson.data[0].plans?.filter((p: IPricingPlan) => p.isActive) || [];
          setPlans(activePlans);
          if (activePlans.length > 0) {
            setPricingPlanId(activePlans[0]._id);
          }
        }
      } catch {
        toast.error('Failed to load setup data');
      }
    }
    loadData();
  }, [customerId]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProdId = e.target.value;
    setProductId(selectedProdId);
    const prod = products.find((p) => p._id === selectedProdId);
    const activePlans = prod?.plans?.filter((p) => p.isActive) || [];
    setPlans(activePlans);
    setPricingPlanId(activePlans[0]?._id || '');
  };

  const selectedPlan = plans.find((p) => p._id === pricingPlanId);
  const calculatedNextBilling = selectedPlan && startDate
    ? calculateNextBillingDate(startDate, selectedPlan.billingInterval, selectedPlan.billingIntervalCount)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error('Customer must be selected');
      return;
    }
    if (!productId || !pricingPlanId) {
      toast.error('Product and active plan tier must be selected');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          productId,
          pricingPlanId,
          startDate,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        toast.success('Subscription activated! Initial invoice issued.');
        router.push(`/subscriptions/${json.data.subscription._id}`);
      } else {
        toast.error(json.error || 'Failed to create subscription');
      }
    } catch {
      toast.error('Error creating subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/subscriptions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Create Subscription
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign recurring SaaS billing tiers to customer accounts.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Parameters</CardTitle>
          <CardDescription>
            Select customer, product package, and pricing tier.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Customer Account *"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              options={customers.map((c) => ({
                value: c._id,
                label: `${c.fullName} (${c.companyName || c.email})`,
              }))}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Product Package *"
                value={productId}
                onChange={handleProductChange}
                options={products.map((p) => ({ value: p._id, label: p.name }))}
                required
              />

              <Select
                label="Plan Tier *"
                value={pricingPlanId}
                onChange={(e) => setPricingPlanId(e.target.value)}
                options={plans.map((p) => ({
                  value: p._id,
                  label: `${p.name} - ${formatCurrency(p.amount, p.currency)} (${p.billingInterval})`,
                }))}
                required
                disabled={plans.length === 0}
              />
            </div>

            <Input
              label="Start Date *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />

            {selectedPlan && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[10px]">
                  Lifecycle Preview
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tier:</span>
                  <span className="font-semibold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cadence:</span>
                  <span className="font-semibold capitalize">{selectedPlan.billingInterval}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recurring Price:</span>
                  <span className="font-bold text-indigo-600">
                    {formatCurrency(selectedPlan.amount, selectedPlan.currency)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Next Billing Renewal:</span>
                  <span className="font-semibold">
                    {calculatedNextBilling ? formatDate(calculatedNextBilling) : 'None'}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <Link href="/subscriptions">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" isLoading={loading} disabled={plans.length === 0}>
                <Repeat className="w-4 h-4 mr-1.5" />
                Activate Subscription
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewSubscriptionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading subscription wizard...</div>}>
      <NewSubscriptionForm />
    </Suspense>
  );
}
