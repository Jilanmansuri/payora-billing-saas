import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import { roundToTwo } from '@/lib/utils';
import { logActivity } from './activity.service';
import mongoose from 'mongoose';

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  invoiceId?: string;
  customerId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function getPayments(params: PaymentQueryParams = {}) {
  await connectToDatabase();
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  if (params.paymentMethod && params.paymentMethod !== 'all') {
    query.paymentMethod = params.paymentMethod;
  }

  if (params.paymentStatus && params.paymentStatus !== 'all') {
    query.paymentStatus = params.paymentStatus;
  }

  if (params.invoiceId && mongoose.Types.ObjectId.isValid(params.invoiceId)) {
    query.invoiceId = params.invoiceId;
  }

  if (params.customerId && mongoose.Types.ObjectId.isValid(params.customerId)) {
    query.customerId = params.customerId;
  }

  if (params.startDate || params.endDate) {
    query.paymentDate = {};
    if (params.startDate) {
      (query.paymentDate as Record<string, unknown>).$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      (query.paymentDate as Record<string, unknown>).$lte = new Date(params.endDate);
    }
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    const [matchingInvoices, matchingCustomers] = await Promise.all([
      Invoice.find({ invoiceNumber: { $regex: s, $options: 'i' } }).select('_id'),
      Customer.find({
        $or: [{ fullName: { $regex: s, $options: 'i' } }, { email: { $regex: s, $options: 'i' } }],
      }).select('_id'),
    ]);

    const invoiceIds = matchingInvoices.map((i) => i._id);
    const customerIds = matchingCustomers.map((c) => c._id);

    query.$or = [
      { paymentId: { $regex: s, $options: 'i' } },
      { transactionReference: { $regex: s, $options: 'i' } },
      { invoiceId: { $in: invoiceIds } },
      { customerId: { $in: customerIds } },
    ];
  }

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate('invoiceId')
      .populate('customerId')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(query),
  ]);

  return {
    data: payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function recordPayment(data: {
  invoiceId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'upi' | 'card';
  paymentStatus?: 'successful' | 'pending' | 'failed';
  transactionReference: string;
  notes?: string;
  paymentDate?: string;
}) {
  await connectToDatabase();

  const invoice = await Invoice.findById(data.invoiceId).populate('customerId');
  if (!invoice) throw new Error('Invoice not found');

  if (invoice.status === 'paid' && invoice.balance <= 0) {
    throw new Error('This invoice is already fully paid');
  }

  const paymentAmount = roundToTwo(Number(data.amount));
  if (paymentAmount <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  const status = data.paymentStatus || 'successful';

  // Check that successful payment doesn't exceed balance
  if (status === 'successful' && paymentAmount > invoice.balance + 0.01) {
    throw new Error(
      `Payment amount ($${paymentAmount}) cannot exceed remaining balance ($${invoice.balance})`
    );
  }

  const count = await Payment.countDocuments();
  const paymentId = `PAY-${1000 + count + 1}`;

  const payment = await Payment.create({
    paymentId,
    invoiceId: invoice._id,
    customerId: invoice.customerId._id || invoice.customerId,
    amount: paymentAmount,
    paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
    paymentMethod: data.paymentMethod,
    paymentStatus: status,
    transactionReference: data.transactionReference.trim(),
    notes: data.notes || '',
  });

  // Only update invoice if payment was successful
  if (status === 'successful') {
    const newPaidAmount = roundToTwo(invoice.paidAmount + paymentAmount);
    const newBalance = roundToTwo(Math.max(0, invoice.totalAmount - newPaidAmount));

    invoice.paidAmount = newPaidAmount;
    invoice.balance = newBalance;

    if (newBalance <= 0) {
      invoice.status = 'paid';
    } else {
      invoice.status = 'pending';
    }

    await invoice.save();

    const customer = invoice.customerId as unknown as { fullName: string };
    await logActivity({
      type: 'payment_recorded',
      title: 'Payment Received',
      description: `Payment ${paymentId} of $${paymentAmount} received for invoice ${invoice.invoiceNumber} via ${data.paymentMethod.toUpperCase()}`,
      entityId: payment._id.toString(),
      entityType: 'payment',
      metadata: {
        customerName: customer?.fullName,
        invoiceNumber: invoice.invoiceNumber,
        newBalance,
      },
    });
  }

  return payment;
}

