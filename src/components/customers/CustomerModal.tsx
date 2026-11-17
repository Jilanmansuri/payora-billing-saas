'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ICustomer } from '@/types';
import { toast } from 'sonner';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: ICustomer | null;
  onSaved: () => void;
}

export function CustomerModal({ isOpen, onClose, customer, onSaved }: CustomerModalProps) {
  const isEditing = Boolean(customer);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    phoneNumber: '',
    billingAddress: '',
    city: '',
    state: '',
    country: 'United States',
    postalCode: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName || '',
        email: customer.email || '',
        companyName: customer.companyName || '',
        phoneNumber: customer.phoneNumber || '',
        billingAddress: customer.billingAddress || '',
        city: customer.city || '',
        state: customer.state || '',
        country: customer.country || 'United States',
        postalCode: customer.postalCode || '',
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        companyName: '',
        phoneNumber: '',
        billingAddress: '',
        city: '',
        state: '',
        country: 'United States',
        postalCode: '',
      });
    }
  }, [customer, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setLoading(true);
    try {
      const url = isEditing ? `/api/customers/${customer?._id}` : '/api/customers';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(isEditing ? 'Customer updated successfully' : 'Customer created successfully');
        onSaved();
        onClose();
      } else {
        toast.error(json.error || 'Failed to save customer');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Customer' : 'Create New Customer'}
      description={
        isEditing
          ? 'Update the customer profile and billing information.'
          : 'Add a new client or business account to Billora.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Sarah Jenkins"
            required
          />
          <Input
            label="Email Address *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="sarah@example.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Acme Operations LLC"
          />
          <Input
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <Input
          label="Billing Address"
          name="billingAddress"
          value={formData.billingAddress}
          onChange={handleChange}
          placeholder="Street address, suite, unit"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="San Francisco"
          />
          <Input
            label="State / Province"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="CA"
          />
          <Input
            label="Postal Code"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="94107"
          />
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="United States"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {isEditing ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

