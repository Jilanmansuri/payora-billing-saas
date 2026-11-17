import { z } from 'zod';

export const customerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().max(20).optional().or(z.literal('')),
  companyName: z.string().max(100).optional().or(z.literal('')),
  billingAddress: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  category: z.string().min(2, 'Category is required').max(50),
  status: z.enum(['active', 'archived']).default('active'),
});

export const pricingPlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters').max(100),
  productId: z.string().min(1, 'Product ID is required'),
  amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  billingInterval: z.enum(['monthly', 'yearly', 'one-time']),
  billingIntervalCount: z.coerce.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
  description: z.string().max(500).optional().or(z.literal('')),
});

export const subscriptionSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  productId: z.string().min(1, 'Product is required'),
  pricingPlanId: z.string().min(1, 'Pricing plan is required'),
  startDate: z.string().optional(),
});

export const changePlanSchema = z.object({
  newPlanId: z.string().min(1, 'New pricing plan is required'),
  notes: z.string().max(200).optional(),
});

export const invoiceLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative'),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  subscriptionId: z.string().optional().nullable(),
  issueDate: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  lineItems: z.array(invoiceLineItemSchema).min(1, 'At least one line item is required'),
  discountType: z.enum(['percentage', 'fixed']).default('percentage'),
  discountValue: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  currency: z.string().length(3).default('USD'),
  notes: z.string().max(500).optional().or(z.literal('')),
  status: z.enum(['draft', 'pending', 'paid', 'overdue']).default('pending'),
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.coerce.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'upi', 'card']),
  transactionReference: z.string().min(1, 'Transaction reference is required'),
  notes: z.string().max(300).optional().or(z.literal('')),
  paymentDate: z.string().optional(),
});

export const settingsSchema = z.object({
  businessName: z.string().min(2, 'Business name is required').max(100),
  businessEmail: z.string().email('Valid business email is required'),
  businessPhone: z.string().min(5, 'Valid phone number is required'),
  businessAddress: z.string().min(5, 'Business address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  businessLogo: z.string().optional().or(z.literal('')),
  defaultCurrency: z.string().length(3).default('USD'),
  defaultTaxPercentage: z.coerce.number().min(0).max(100).default(10),
  invoicePrefix: z.string().min(1).max(10).default('INV'),
  defaultPaymentDueDays: z.coerce.number().int().min(0).max(365).default(15),
});

