import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, addMonths, addYears, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | undefined | null,
  currency: string = 'USD'
): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatDate(
  date: Date | string | null | undefined,
  pattern: string = 'MMM dd, yyyy'
): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return '—';
    return format(d, pattern);
  } catch {
    return '—';
  }
}

export interface LineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

export interface InvoiceCalculationResult {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
}

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateInvoice(
  items: LineItemInput[],
  discountType: 'percentage' | 'fixed' = 'percentage',
  discountValue: number = 0,
  taxRate: number = 0
): InvoiceCalculationResult {
  const validatedItems = items.map((item) => {
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const price = Math.max(0, Number(item.unitPrice) || 0);
    const amount = roundToTwo(qty * price);
    return {
      description: item.description?.trim() || 'Item',
      quantity: qty,
      unitPrice: roundToTwo(price),
      amount,
    };
  });

  const subtotal = roundToTwo(
    validatedItems.reduce((acc, curr) => acc + curr.amount, 0)
  );

  let discountAmount = 0;
  if (discountType === 'percentage') {
    const pct = Math.min(100, Math.max(0, Number(discountValue) || 0));
    discountAmount = roundToTwo((subtotal * pct) / 100);
  } else {
    discountAmount = roundToTwo(
      Math.min(subtotal, Math.max(0, Number(discountValue) || 0))
    );
  }

  const taxableAmount = roundToTwo(Math.max(0, subtotal - discountAmount));
  const rate = Math.max(0, Number(taxRate) || 0);
  const taxAmount = roundToTwo((taxableAmount * rate) / 100);
  const totalAmount = roundToTwo(taxableAmount + taxAmount);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount,
    lineItems: validatedItems,
  };
}

export function calculateNextBillingDate(
  startDate: Date | string,
  interval: 'monthly' | 'yearly' | 'one-time',
  intervalCount: number = 1
): Date | null {
  if (interval === 'one-time') return null;

  const start = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate);
  if (!isValid(start)) return null;

  const count = Math.max(1, intervalCount || 1);

  if (interval === 'monthly') {
    return addMonths(start, count);
  } else if (interval === 'yearly') {
    return addYears(start, count);
  }

  return null;
}

export function getStatusBadgeStyle(status: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'active':
    case 'paid':
    case 'successful':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'pending':
    case 'paused':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case 'past due':
    case 'past_due':
    case 'overdue':
    case 'failed':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
    case 'cancelled':
    case 'draft':
    case 'archived':
    case 'inactive':
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800/60',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}

