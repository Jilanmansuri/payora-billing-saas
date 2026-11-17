'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { formatCurrency, calculateInvoice, roundToTwo } from '@/lib/utils';
import { ICustomer } from '@/types';
import { Plus, Trash2, ArrowLeft, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';

interface LineItemState {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function InvoiceForm({ invoiceId }: { invoiceId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCustId = searchParams.get('customerId') || '';

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [customerId, setCustomerId] = useState(defaultCustId);
  const [issueDate, setIssueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 15), 'yyyy-MM-dd'));
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'pending' | 'draft'>('pending');

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(10);

  const [lineItems, setLineItems] = useState<LineItemState[]>([
    { description: 'Cloud Platform Subscription', quantity: 1, unitPrice: 99 },
  ]);

  useEffect(() => {
    async function init() {
      try {
        const [cRes, sRes] = await Promise.all([
          fetch('/api/customers?limit=100'),
          fetch('/api/settings'),
        ]);
        const [cJson, sJson] = await Promise.all([cRes.json(), sRes.json()]);

        if (cJson.success && cJson.data) {
          setCustomers(cJson.data);
          if (!customerId && cJson.data.length > 0) {
            setCustomerId(cJson.data[0]._id);
          }
        }
        if (sJson.success && sJson.data) {
          setTaxRate(sJson.data.defaultTaxPercentage ?? 10);
          setCurrency(sJson.data.defaultCurrency || 'USD');
          const dueDays = sJson.data.defaultPaymentDueDays || 15;
          setDueDate(format(addDays(new Date(), dueDays), 'yyyy-MM-dd'));
        }
      } catch {
        toast.error('Failed to load initial settings');
      }
    }
    init();
  }, []);

  const handleLineItemChange = (
    index: number,
    field: keyof LineItemState,
    val: string | number
  ) => {
    const updated = [...lineItems];
    if (field === 'description') {
      updated[index].description = String(val);
    } else {
      updated[index][field] = Math.max(0, Number(val) || 0);
    }
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) {
      toast.warning('An invoice requires at least one line item');
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Live Calculations
  const calc = calculateInvoice(lineItems, discountType, discountValue, taxRate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (lineItems.some((item) => !item.description.trim())) {
      toast.error('All line items must have a description');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerId,
        issueDate,
        dueDate,
        lineItems,
        discountType,
        discountValue,
        taxRate,
        currency,
        notes,
        status,
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        toast.success(`Invoice ${json.data.invoiceNumber} created successfully!`);
        router.push(`/invoices/${json.data._id}`);
      } else {
        toast.error(json.error || 'Failed to create invoice');
      }
    } catch {
      toast.error('Error submitting invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => router.push('/invoices')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Create New Invoice
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Build an itemized invoice with automated subtotal, discount, and tax calculations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStatus('draft')}
            disabled={loading}
          >
            Save as Draft
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Generate & Issue Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Customer & Line Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Customer *"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                options={customers.map((c) => ({
                  value: c._id,
                  label: `${c.fullName} (${c.companyName || c.email})`,
                }))}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Issue Date *"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
                <Input
                  label="Due Date *"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
                <Select
                  label="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                    { value: 'INR', label: 'INR (₹)' },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Add services, license units, or add-ons</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                {lineItems.map((item, index) => {
                  const lineTotal = roundToTwo(item.quantity * item.unitPrice);
                  return (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 grid grid-cols-12 gap-3 items-center"
                    >
                      <div className="col-span-12 sm:col-span-6">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleLineItemChange(index, 'description', e.target.value)
                          }
                          placeholder="Item or service description"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleLineItemChange(index, 'quantity', e.target.value)
                          }
                          placeholder="Qty"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                          required
                        />
                      </div>

                      <div className="col-span-5 sm:col-span-3 flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleLineItemChange(index, 'unitPrice', e.target.value)
                          }
                          placeholder="Price"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                          required
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-16 text-right shrink-0">
                          {formatCurrency(lineTotal, currency)}
                        </span>
                      </div>

                      <div className="col-span-3 sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Textarea
                label="Invoice Notes & Terms"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, bank transfer details, or thank you message..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Calculation Summary */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-600" />
                Payment & Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Discount Controls */}
              <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Discount
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    options={[
                      { value: 'percentage', label: 'Percent (%)' },
                      { value: 'fixed', label: `Fixed (${currency})` },
                    ]}
                  />
                  <Input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Tax Rate Controls */}
              <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Tax Rate (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Breakdown */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(calc.subtotal, currency)}
                  </span>
                </div>

                {calc.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount:</span>
                    <span>-{formatCurrency(calc.discountAmount, currency)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500">
                  <span>Taxable Amount:</span>
                  <span>{formatCurrency(calc.taxableAmount, currency)}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Tax ({taxRate}%):</span>
                  <span>+{formatCurrency(calc.taxAmount, currency)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Grand Total:
                  </span>
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(calc.totalAmount, currency)}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                  Issue Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

