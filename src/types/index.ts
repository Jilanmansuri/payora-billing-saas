export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past_due';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'upi' | 'card';
export type PaymentStatus = 'successful' | 'pending' | 'failed';
export type BillingInterval = 'monthly' | 'yearly' | 'one-time';
export type ProductStatus = 'active' | 'archived';

export interface ICustomer {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  companyName?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed / aggregated fields
  totalSpent?: number;
  activeSubscriptionsCount?: number;
  invoicesCount?: number;
  unpaidBalance?: number;
}

export interface IProduct {
  _id: string;
  name: string;
  description?: string;
  category: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  plans?: IPricingPlan[];
}

export interface IPricingPlan {
  _id: string;
  name: string;
  productId: string | IProduct;
  amount: number;
  currency: string;
  billingInterval: BillingInterval;
  billingIntervalCount: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubscriptionHistory {
  date: string;
  action: 'created' | 'paused' | 'resumed' | 'cancelled' | 'plan_changed' | 'renewed';
  notes?: string;
  previousPlanId?: string;
  newPlanId?: string;
}

export interface ISubscription {
  _id: string;
  subscriptionId: string;
  customerId: string | ICustomer;
  productId: string | IProduct;
  pricingPlanId: string | IPricingPlan;
  amount: number;
  currency: string;
  billingInterval: BillingInterval;
  startDate: string;
  nextBillingDate?: string | null;
  endDate?: string | null;
  cancelledAt?: string | null;
  status: SubscriptionStatus;
  history: ISubscriptionHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface IInvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface IInvoice {
  _id: string;
  invoiceNumber: string;
  customerId: string | ICustomer;
  subscriptionId?: string | ISubscription | null;
  issueDate: string;
  dueDate: string;
  lineItems: IInvoiceLineItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  currency: string;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPayment {
  _id: string;
  paymentId: string;
  invoiceId: string | IInvoice;
  customerId: string | ICustomer;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IActivity {
  _id: string;
  type:
    | 'customer_created'
    | 'subscription_created'
    | 'subscription_paused'
    | 'subscription_resumed'
    | 'subscription_cancelled'
    | 'subscription_changed'
    | 'invoice_generated'
    | 'payment_recorded'
    | 'product_created';
  title: string;
  description: string;
  entityId?: string;
  entityType?: 'customer' | 'subscription' | 'invoice' | 'payment' | 'product';
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface IBusinessSettings {
  _id?: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  businessLogo?: string;
  defaultCurrency: string;
  defaultTaxPercentage: number;
  invoicePrefix: string;
  defaultPaymentDueDays: number;
  updatedAt?: string;
}

export interface IDashboardStats {
  totalRevenue: {
    value: number;
    changePercentage: number;
    previousValue: number;
  };
  mrr: {
    value: number;
    changePercentage: number;
    previousValue: number;
  };
  activeSubscriptions: {
    value: number;
    changePercentage: number;
    previousValue: number;
  };
  totalCustomers: {
    value: number;
    changePercentage: number;
    previousValue: number;
  };
  pendingInvoices: {
    value: number;
    amount: number;
  };
  overdueInvoices: {
    value: number;
    amount: number;
  };
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

