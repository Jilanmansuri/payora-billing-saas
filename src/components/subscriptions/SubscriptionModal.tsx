'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency, calculateNextBillingDate, formatDate } from '@/lib/utils';
import { ICustomer, IProduct, IPricingPlan } from '@/types';
import { toast } from 'sonner';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCustomerId?: string;
  onSaved: () => void;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  defaultCustomerId,
  onSaved,
}: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [plans, setPlans] = useState<IPricingPlan[]>([]);

  const [customerId, setCustomerId] = useState(defaultCustomerId || '');
  const [productId, setProductId] = useState('');
  const [pricingPlanId, setPricingPlanId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, pRes] = await Promise.all([
          fetch('/api/customers?limit=100'),
          fetch('/api/products'),
        ]);
        const [cJson, pJson] = await Promise.all([cRes.json(), pRes.json()]);

        if (cJson.success) setCustomers(cJson.data);
        if (pJson.success) {
          setProducts(pJson.data);
          if (pJson.data.length > 0) {
            setProductId(pJson.data[0]._id);
            setPlans(pJson.data[0].plans?.filter((p: IPricingPlan) => p.isActive) || []);
            if (pJson.data[0].plans?.length > 0) {
              setPricingPlanId(pJson.data[0].plans[0]._id);
            }
          }
        }
      } catch {
        toast.error('Failed to load setup data');
      }
    }
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultCustomerId) {
      setCustomerId(defaultCustomerId);
    } else if (customers.length > 0 && !customerId) {
      setCustomerId(customers[0]._id);
    }
  }, [customers, defaultCustomerId, customerId]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProdId = e.target.value;
    setProductId(selectedProdId);
    const prod = products.find((p) => p._id === selectedProdId);
    const activePlans = prod?.plans?.filter((p) => p.isActive) || [];
    setPlans(activePlans);
    setPricingPlanId(activePlans[0]?._id || '');
  };

  const selectedPlan = plans.find((p) => p._id === pricingPlanId);

  const calculatedNextBilling = selectedPlan
    ? calculateNextBillingDate(startDate, selectedPlan.billingInterval, selectedPlan.billingIntervalCount)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error('Customer must be selected');
      return;
    }
    if (!productId || !pricingPlanId) {
      toast.error('Product and active pricing plan must be selected');
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
      if (json.success) {
        toast.success('Subscription activated! Initial invoice generated.');
        onSaved();
        onClose();
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Subscription"
      description="Subscribe a customer to a recurring billing plan. An initial pending invoice will be automatically generated."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Customer *"
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
            label="Pricing Plan Tier *"
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

        {plans.length === 0 && (
          <p className="text-xs text-rose-500 font-medium">
            This product has no active plans. Please activate or add a pricing tier first.
          </p>
        )}

        <Input
          label="Subscription Start Date *"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />

        {/* Calculation Summary Preview Card */}
        {selectedPlan && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-2">
            <h5 className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
              Subscription Summary & Lifecycle Preview
            </h5>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500">Plan & Billing Interval:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                {selectedPlan.name} ({selectedPlan.billingInterval})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500">Recurring Price:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(selectedPlan.amount, selectedPlan.currency)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Calculated Next Billing Date:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {calculatedNextBilling ? formatDate(calculatedNextBilling) : 'One-time (no renewal)'}
              </span>
            </div>
          </div>
        )}

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} disabled={plans.length === 0}>
            Activate Subscription
          </Button>
        </div>
      </form>
    </Modal>
  );
}

