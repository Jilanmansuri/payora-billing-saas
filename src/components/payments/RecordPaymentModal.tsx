'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { IInvoice } from '@/types';
import { toast } from 'sonner';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultInvoiceId?: string;
  invoiceBalance?: number;
  invoiceNumber?: string;
  onSaved: () => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  defaultInvoiceId,
  invoiceBalance,
  invoiceNumber,
  onSaved,
}: RecordPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(defaultInvoiceId || '');
  const [amount, setAmount] = useState<number>(invoiceBalance || 0);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'upi' | 'cash'>('card');
  const [paymentStatus, setPaymentStatus] = useState<'successful' | 'pending' | 'failed'>('successful');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadInvoices() {
      if (!defaultInvoiceId) {
        try {
          const res = await fetch('/api/invoices?status=pending&limit=50');
          const json = await res.json();
          if (json.success && json.data) {
            setInvoices(json.data);
            if (json.data.length > 0 && !selectedInvoiceId) {
              setSelectedInvoiceId(json.data[0]._id);
              setAmount(json.data[0].balance);
            }
          }
        } catch {
          // ignore
        }
      }
    }
    if (isOpen) {
      loadInvoices();
      setTransactionRef(`TXN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`);
    }
  }, [isOpen, defaultInvoiceId, selectedInvoiceId]);

  useEffect(() => {
    if (invoiceBalance !== undefined) {
      setAmount(invoiceBalance);
    }
  }, [invoiceBalance]);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invId = e.target.value;
    setSelectedInvoiceId(invId);
    const found = invoices.find((i) => i._id === invId);
    if (found) {
      setAmount(found.balance);
    }
  };

  const handlePayFull = () => {
    if (invoiceBalance !== undefined) {
      setAmount(invoiceBalance);
    } else {
      const found = invoices.find((i) => i._id === selectedInvoiceId);
      if (found) setAmount(found.balance);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      toast.error('Invoice must be selected');
      return;
    }

    if (amount <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        invoiceId: selectedInvoiceId,
        amount,
        paymentMethod,
        paymentStatus,
        transactionReference: transactionRef,
        notes,
      };

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Payment recorded successfully! Ref: ${transactionRef}`);
        onSaved();
        onClose();
      } else {
        toast.error(json.error || 'Failed to record payment');
      }
    } catch {
      toast.error('Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Simulated Payment"
      description="Record a simulated customer transaction. Partial payments will decrease the invoice balance."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {defaultInvoiceId ? (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-400 block text-[11px]">Invoice</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {invoiceNumber}
            </span>
            <span className="text-slate-500 ml-2">
              (Outstanding Balance: {formatCurrency(invoiceBalance)})
            </span>
          </div>
        ) : (
          <Select
            label="Select Invoice *"
            value={selectedInvoiceId}
            onChange={handleInvoiceChange}
            options={invoices.map((inv) => ({
              value: inv._id,
              label: `${inv.invoiceNumber} - Due: ${formatCurrency(inv.balance)} (${inv.status})`,
            }))}
            required
          />
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Payment Amount *
            </label>
            <button
              type="button"
              onClick={handlePayFull}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Pay Full Balance
            </button>
          </div>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Payment Method *"
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as 'card' | 'bank_transfer' | 'upi' | 'cash')
            }
            options={[
              { value: 'card', label: 'Credit Card (Simulated)' },
              { value: 'bank_transfer', label: 'Bank Transfer / Wire' },
              { value: 'upi', label: 'UPI / QR' },
              { value: 'cash', label: 'Cash / Direct' },
            ]}
          />

          <Select
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) =>
              setPaymentStatus(e.target.value as 'successful' | 'pending' | 'failed')
            }
            options={[
              { value: 'successful', label: 'Successful (Settled)' },
              { value: 'pending', label: 'Pending (In Transit)' },
              { value: 'failed', label: 'Failed (Declined)' },
            ]}
          />
        </div>

        <Input
          label="Transaction Reference *"
          value={transactionRef}
          onChange={(e) => setTransactionRef(e.target.value)}
          placeholder="e.g. TXN-109283"
          required
        />

        <Textarea
          label="Payment Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes or gateway response log..."
          rows={2}
        />

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}

