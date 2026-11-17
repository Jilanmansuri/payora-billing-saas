import connectToDatabase from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import Payment from '@/models/Payment';
import BusinessSettings from '@/models/BusinessSettings';
import { calculateInvoice, LineItemInput } from '@/lib/utils';
import { logActivity } from './activity.service';
import mongoose from 'mongoose';
import { addDays } from 'date-fns';

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export async function getInvoices(params: InvoiceQueryParams = {}) {
  await connectToDatabase();
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  if (params.status && params.status !== 'all') {
    query.status = params.status;
  }

  if (params.customerId && mongoose.Types.ObjectId.isValid(params.customerId)) {
    query.customerId = params.customerId;
  }

  if (params.startDate || params.endDate) {
    query.issueDate = {};
    if (params.startDate) {
      (query.issueDate as Record<string, unknown>).$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      (query.issueDate as Record<string, unknown>).$lte = new Date(params.endDate);
    }
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    const matchingCustomers = await Customer.find({
      $or: [{ fullName: { $regex: s, $options: 'i' } }, { email: { $regex: s, $options: 'i' } }],
    }).select('_id');

    const customerIds = matchingCustomers.map((c) => c._id);
    query.$or = [{ invoiceNumber: { $regex: s, $options: 'i' } }, { customerId: { $in: customerIds } }];
  }

  const [invoices, total] = await Promise.all([
    Invoice.find(query)
      .populate('customerId')
      .populate('subscriptionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Invoice.countDocuments(query),
  ]);

  return {
    data: invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getInvoiceById(id: string) {
  await connectToDatabase();

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { invoiceNumber: id }] }
    : { invoiceNumber: id };

  const invoice = await Invoice.findOne(query)
    .populate('customerId')
    .populate('subscriptionId')
    .lean();

  if (!invoice) return null;

  const payments = await Payment.find({ invoiceId: invoice._id })
    .sort({ paymentDate: -1 })
    .lean();

  const settings = await BusinessSettings.findOne().lean();

  return {
    ...invoice,
    payments,
    businessSettings: settings,
  };
}

export async function createInvoice(data: {
  customerId: string;
  subscriptionId?: string | null;
  issueDate?: string;
  dueDate?: string;
  lineItems: LineItemInput[];
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  taxRate?: number;
  currency?: string;
  notes?: string;
  status?: 'draft' | 'pending' | 'paid' | 'overdue';
}) {
  await connectToDatabase();

  const customer = await Customer.findById(data.customerId);
  if (!customer) throw new Error('Customer not found');

  const settings = await BusinessSettings.findOne();
  const prefix = settings?.invoicePrefix || 'INV';
  const defaultDueDays = settings?.defaultPaymentDueDays || 15;
  const defaultTaxRate = settings?.defaultTaxPercentage || 0;

  const count = await Invoice.countDocuments();
  const invoiceNumber = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

  const issue = data.issueDate ? new Date(data.issueDate) : new Date();
  const due = data.dueDate ? new Date(data.dueDate) : addDays(issue, defaultDueDays);

  const tax = typeof data.taxRate === 'number' ? data.taxRate : defaultTaxRate;
  const discType = data.discountType || 'percentage';
  const discVal = data.discountValue || 0;

  const calc = calculateInvoice(data.lineItems, discType, discVal, tax);

  const invoice = await Invoice.create({
    invoiceNumber,
    customerId: customer._id,
    subscriptionId: data.subscriptionId && mongoose.Types.ObjectId.isValid(data.subscriptionId) ? data.subscriptionId : null,
    issueDate: issue,
    dueDate: due,
    lineItems: calc.lineItems,
    subtotal: calc.subtotal,
    discountType: discType,
    discountValue: discVal,
    discountAmount: calc.discountAmount,
    taxableAmount: calc.taxableAmount,
    taxRate: tax,
    taxAmount: calc.taxAmount,
    totalAmount: calc.totalAmount,
    paidAmount: 0,
    balance: calc.totalAmount,
    currency: data.currency || settings?.defaultCurrency || 'USD',
    status: data.status || 'pending',
    notes: data.notes || '',
  });

  await logActivity({
    type: 'invoice_generated',
    title: 'Invoice Created',
    description: `Invoice ${invoiceNumber} created for ${customer.fullName} ($${calc.totalAmount})`,
    entityId: invoice._id.toString(),
    entityType: 'invoice',
  });

  return invoice;
}

export async function updateInvoice(
  id: string,
  data: {
    lineItems?: LineItemInput[];
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    taxRate?: number;
    dueDate?: string;
    notes?: string;
    status?: 'draft' | 'pending' | 'paid' | 'overdue';
  }
) {
  await connectToDatabase();
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new Error('Invoice not found');

  if (invoice.paidAmount > 0 && data.lineItems) {
    throw new Error('Cannot modify line items on an invoice that already has recorded payments');
  }

  if (data.lineItems) {
    const discType = data.discountType || invoice.discountType;
    const discVal = typeof data.discountValue === 'number' ? data.discountValue : invoice.discountValue;
    const tax = typeof data.taxRate === 'number' ? data.taxRate : invoice.taxRate;

    const calc = calculateInvoice(data.lineItems, discType, discVal, tax);
    invoice.lineItems = calc.lineItems as unknown as typeof invoice.lineItems;
    invoice.subtotal = calc.subtotal;
    invoice.discountType = discType;
    invoice.discountValue = discVal;
    invoice.discountAmount = calc.discountAmount;
    invoice.taxableAmount = calc.taxableAmount;
    invoice.taxRate = tax;
    invoice.taxAmount = calc.taxAmount;
    invoice.totalAmount = calc.totalAmount;
    invoice.balance = Math.max(0, calc.totalAmount - invoice.paidAmount);
  }

  if (data.dueDate) {
    invoice.dueDate = new Date(data.dueDate);
  }
  if (data.notes !== undefined) {
    invoice.notes = data.notes;
  }
  if (data.status) {
    invoice.status = data.status;
  }

  await invoice.save();
  return invoice;
}

export async function deleteInvoice(id: string) {
  await connectToDatabase();
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new Error('Invoice not found');

  const paymentsCount = await Payment.countDocuments({ invoiceId: id });
  if (paymentsCount > 0 || invoice.paidAmount > 0) {
    throw new Error('Cannot delete an invoice with payment records attached');
  }

  await Invoice.findByIdAndDelete(id);
  return { deleted: true, message: 'Invoice deleted successfully.' };
}

