'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { IBusinessSettings } from '@/types';
import { Building, Save, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function BusinessSettingsForm() {
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [formData, setFormData] = useState<IBusinessSettings>({
    businessName: 'Billora Cloud Inc.',
    businessEmail: 'billing@billora.io',
    businessPhone: '+1 (555) 019-2834',
    businessAddress: '100 Innovation Way, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    postalCode: '94107',
    businessLogo: '',
    defaultCurrency: 'USD',
    defaultTaxPercentage: 10,
    invoicePrefix: 'INV',
    defaultPaymentDueDays: 15,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success && json.data) {
          setFormData(json.data);
        }
      } catch {
        toast.error('Failed to load business settings');
      }
    }
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'defaultTaxPercentage' || name === 'defaultPaymentDueDays'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Business settings updated successfully!');
      } else {
        toast.error(json.error || 'Failed to update settings');
      }
    } catch {
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReSeed = async () => {
    if (!confirm('This will reset and re-seed sample customers, products, subscriptions, and invoices. Continue?')) {
      return;
    }
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dropExisting: true }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Database re-seeded successfully!');
        window.location.reload();
      } else {
        toast.error(json.error || 'Failed to re-seed');
      }
    } catch {
      toast.error('Error during database re-seed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Platform & Business Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure organization identity, invoice prefixes, tax rates, and default payment terms.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Identity</CardTitle>
            <CardDescription>
              These details appear on generated printable PDFs and invoice receipts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Legal Name *"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
              <Input
                label="Billing Email *"
                type="email"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                name="businessPhone"
                value={formData.businessPhone}
                onChange={handleChange}
              />
              <Input
                label="Street Address"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              <Input
                label="State / Province"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
              <Input
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
              />
              <Input
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoicing & Financial Defaults</CardTitle>
            <CardDescription>
              Control currency formatting, tax rates, and due date spans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Default Currency"
                name="defaultCurrency"
                value={formData.defaultCurrency}
                onChange={handleChange}
                options={[
                  { value: 'USD', label: 'USD ($) - US Dollar' },
                  { value: 'EUR', label: 'EUR (€) - Euro' },
                  { value: 'GBP', label: 'GBP (£) - British Pound' },
                  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                ]}
              />

              <Input
                label="Default Sales Tax (%)"
                type="number"
                min="0"
                max="100"
                step="0.1"
                name="defaultTaxPercentage"
                value={formData.defaultTaxPercentage}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Invoice Number Prefix"
                name="invoicePrefix"
                value={formData.invoicePrefix}
                onChange={handleChange}
                helperText="e.g. 'INV' creates INV-2026-0001"
              />

              <Input
                label="Default Payment Due Days"
                type="number"
                min="0"
                max="365"
                name="defaultPaymentDueDays"
                value={formData.defaultPaymentDueDays}
                onChange={handleChange}
                helperText="Days from invoice generation until payment is marked overdue"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" isLoading={loading}>
                <Save className="w-4 h-4 mr-1.5" />
                Save Business Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Danger / Demo Zone */}
      <Card className="border-rose-200 dark:border-rose-900/50">
        <CardHeader>
          <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Demo Data Management
          </CardTitle>
          <CardDescription>
            Reset database tables and seed fresh demo customers, subscriptions, invoices, and payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Reseeding wipes existing transactional records and inserts 15 realistic customers, 8 products, 12 plans, 20 subscriptions, 30 invoices, and 35 payment records.
          </p>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleReSeed}
            isLoading={seeding}
            className="shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Reset & Re-Seed Database
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

