'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { IPricingPlan, IProduct } from '@/types';
import { toast } from 'sonner';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: IProduct[];
  selectedProductId?: string;
  plan?: IPricingPlan | null;
  onSaved: () => void;
}

export function PlanModal({
  isOpen,
  onClose,
  products,
  selectedProductId,
  plan,
  onSaved,
}: PlanModalProps) {
  const isEditing = Boolean(plan);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    productId: selectedProductId || (products[0]?._id || ''),
    amount: 49,
    currency: 'USD',
    billingInterval: 'monthly',
    billingIntervalCount: 1,
    isActive: true,
    description: '',
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        productId: typeof plan.productId === 'object' ? (plan.productId as unknown as { _id: string })._id : plan.productId,
        amount: plan.amount || 0,
        currency: plan.currency || 'USD',
        billingInterval: plan.billingInterval || 'monthly',
        billingIntervalCount: plan.billingIntervalCount || 1,
        isActive: plan.isActive ?? true,
        description: plan.description || '',
      });
    } else {
      setFormData({
        name: '',
        productId: selectedProductId || (products[0]?._id || ''),
        amount: 49,
        currency: 'USD',
        billingInterval: 'monthly',
        billingIntervalCount: 1,
        isActive: true,
        description: '',
      });
    }
  }, [plan, selectedProductId, products, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    if (!formData.productId) {
      toast.error('Product must be selected');
      return;
    }

    setLoading(true);
    try {
      const url = isEditing ? `/api/plans/${plan?._id}` : '/api/plans';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(isEditing ? 'Plan updated' : 'Pricing plan created');
        onSaved();
        onClose();
      } else {
        toast.error(json.error || 'Failed to save plan');
      }
    } catch {
      toast.error('Error saving pricing plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
      description="Configure pricing, billing recurrence, and features for this tier."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Associated Product *"
          value={formData.productId}
          onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
          options={products.map((p) => ({ value: p._id, label: p.name }))}
          disabled={Boolean(selectedProductId)}
        />

        <Input
          label="Plan Tier Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Pro Monthly, Growth Annual"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount (in Currency) *"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            required
          />

          <Select
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            options={[
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'INR', label: 'INR (₹)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Billing Interval"
            value={formData.billingInterval}
            onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value })}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
              { value: 'one-time', label: 'One-time' },
            ]}
          />

          <Select
            label="Status"
            value={formData.isActive ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
            options={[
              { value: 'true', label: 'Active (Available for subscriptions)' },
              { value: 'false', label: 'Inactive (Hidden from new subscriptions)' },
            ]}
          />
        </div>

        <Textarea
          label="Plan Description & Quotas"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g. Includes up to 10k monthly active users, 24/7 SLA..."
          rows={3}
        />

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {isEditing ? 'Save Changes' : 'Create Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

