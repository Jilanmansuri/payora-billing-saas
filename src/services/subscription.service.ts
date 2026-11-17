import connectToDatabase from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import PricingPlan from '@/models/PricingPlan';
import Invoice from '@/models/Invoice';
import BusinessSettings from '@/models/BusinessSettings';
import { calculateNextBillingDate, calculateInvoice } from '@/lib/utils';
import { logActivity } from './activity.service';
import mongoose from 'mongoose';
import { addDays } from 'date-fns';

export interface SubscriptionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  billingInterval?: string;
  customerId?: string;
}

export async function getSubscriptions(params: SubscriptionQueryParams = {}) {
  await connectToDatabase();
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  if (params.status && params.status !== 'all') {
    query.status = params.status;
  }

  if (params.billingInterval && params.billingInterval !== 'all') {
    query.billingInterval = params.billingInterval;
  }

  if (params.customerId && mongoose.Types.ObjectId.isValid(params.customerId)) {
    query.customerId = params.customerId;
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    // Find matching customers or products
    const [matchingCustomers, matchingProducts] = await Promise.all([
      Customer.find({
        $or: [{ fullName: { $regex: s, $options: 'i' } }, { email: { $regex: s, $options: 'i' } }],
      }).select('_id'),
      Product.find({ name: { $regex: s, $options: 'i' } }).select('_id'),
    ]);

    const customerIds = matchingCustomers.map((c) => c._id);
    const productIds = matchingProducts.map((p) => p._id);

    query.$or = [
      { subscriptionId: { $regex: s, $options: 'i' } },
      { customerId: { $in: customerIds } },
      { productId: { $in: productIds } },
    ];
  }

  const [subscriptions, total] = await Promise.all([
    Subscription.find(query)
      .populate('customerId')
      .populate('productId')
      .populate('pricingPlanId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Subscription.countDocuments(query),
  ]);

  return {
    data: subscriptions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getSubscriptionById(id: string) {
  await connectToDatabase();

  const query = mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { subscriptionId: id }] }
    : { subscriptionId: id };

  const subscription = await Subscription.findOne(query)
    .populate('customerId')
    .populate('productId')
    .populate('pricingPlanId')
    .populate('history.previousPlanId')
    .populate('history.newPlanId')
    .lean();

  if (!subscription) return null;

  // Retrieve invoices associated with this subscription
  const invoices = await Invoice.find({ subscriptionId: subscription._id })
    .sort({ issueDate: -1 })
    .lean();

  return {
    ...subscription,
    invoices,
  };
}

export async function createSubscription(data: {
  customerId: string;
  productId: string;
  pricingPlanId: string;
  startDate?: string;
  autoGenerateInvoice?: boolean;
}) {
  await connectToDatabase();

  const [customer, product, plan] = await Promise.all([
    Customer.findById(data.customerId),
    Product.findById(data.productId),
    PricingPlan.findById(data.pricingPlanId),
  ]);

  if (!customer) throw new Error('Customer not found');
  if (customer.isArchived) throw new Error('Cannot create subscription for an archived customer');
  if (!product) throw new Error('Product not found');
  if (!plan) throw new Error('Pricing plan not found');
  if (!plan.isActive) throw new Error('Cannot subscribe to an inactive pricing plan');

  const count = await Subscription.countDocuments();
  const subscriptionId = `SUB-${1000 + count + 1}`;

  const start = data.startDate ? new Date(data.startDate) : new Date();
  const nextBilling = calculateNextBillingDate(start, plan.billingInterval, plan.billingIntervalCount);

  const subscription = await Subscription.create({
    subscriptionId,
    customerId: customer._id,
    productId: product._id,
    pricingPlanId: plan._id,
    amount: plan.amount,
    currency: plan.currency,
    billingInterval: plan.billingInterval,
    startDate: start,
    nextBillingDate: nextBilling,
    status: 'active',
    history: [
      {
        date: new Date(),
        action: 'created',
        notes: `Subscribed to ${plan.name} (${plan.billingInterval})`,
        newPlanId: plan._id,
      },
    ],
  });

  // Automatically generate initial invoice
  const settings = await BusinessSettings.findOne();
  const dueDays = settings?.defaultPaymentDueDays || 15;
  const prefix = settings?.invoicePrefix || 'INV';
  const taxRate = settings?.defaultTaxPercentage || 0;

  const invCount = await Invoice.countDocuments();
  const invoiceNumber = `${prefix}-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, '0')}`;

  const lineItems = [
    {
      description: `${product.name} - ${plan.name} (${plan.billingInterval})`,
      quantity: 1,
      unitPrice: plan.amount,
      amount: plan.amount,
    },
  ];

  const calc = calculateInvoice(lineItems, 'percentage', 0, taxRate);

  const invoice = await Invoice.create({
    invoiceNumber,
    customerId: customer._id,
    subscriptionId: subscription._id,
    issueDate: start,
    dueDate: addDays(start, dueDays),
    lineItems: calc.lineItems,
    subtotal: calc.subtotal,
    discountType: 'percentage',
    discountValue: 0,
    discountAmount: 0,
    taxableAmount: calc.taxableAmount,
    taxRate,
    taxAmount: calc.taxAmount,
    totalAmount: calc.totalAmount,
    paidAmount: 0,
    balance: calc.totalAmount,
    currency: plan.currency,
    status: 'pending',
    notes: `Initial invoice for Subscription ${subscriptionId}`,
  });

  await logActivity({
    type: 'subscription_created',
    title: 'New Subscription Started',
    description: `Subscription ${subscriptionId} for ${customer.fullName} created on ${plan.name}`,
    entityId: subscription._id.toString(),
    entityType: 'subscription',
  });

  await logActivity({
    type: 'invoice_generated',
    title: 'Subscription Invoice Generated',
    description: `Invoice ${invoiceNumber} created for subscription ${subscriptionId}`,
    entityId: invoice._id.toString(),
    entityType: 'invoice',
  });

  return { subscription, invoice };
}

export async function pauseSubscription(id: string, notes?: string) {
  await connectToDatabase();
  const sub = await Subscription.findById(id);
  if (!sub) throw new Error('Subscription not found');
  if (sub.status === 'cancelled') throw new Error('Cannot pause a cancelled subscription');
  if (sub.status === 'paused') throw new Error('Subscription is already paused');

  sub.status = 'paused';
  sub.history.push({
    date: new Date(),
    action: 'paused',
    notes: notes || 'Subscription paused by user',
  });

  await sub.save();

  await logActivity({
    type: 'subscription_paused',
    title: 'Subscription Paused',
    description: `Subscription ${sub.subscriptionId} was paused`,
    entityId: sub._id.toString(),
    entityType: 'subscription',
  });

  return sub;
}

export async function resumeSubscription(id: string, notes?: string) {
  await connectToDatabase();
  const sub = await Subscription.findById(id).populate('pricingPlanId');
  if (!sub) throw new Error('Subscription not found');
  if (sub.status === 'cancelled') throw new Error('Cancelled subscriptions cannot be resumed directly');
  if (sub.status === 'active') throw new Error('Subscription is already active');

  sub.status = 'active';

  // Recalculate next billing date if past or null
  const now = new Date();
  if (!sub.nextBillingDate || new Date(sub.nextBillingDate) < now) {
    const plan = sub.pricingPlanId as unknown as { billingInterval: 'monthly' | 'yearly' | 'one-time'; billingIntervalCount: number };
    sub.nextBillingDate = calculateNextBillingDate(
      now,
      plan?.billingInterval || sub.billingInterval,
      plan?.billingIntervalCount || 1
    );
  }

  sub.history.push({
    date: new Date(),
    action: 'resumed',
    notes: notes || 'Subscription resumed',
  });

  await sub.save();

  await logActivity({
    type: 'subscription_resumed',
    title: 'Subscription Resumed',
    description: `Subscription ${sub.subscriptionId} was resumed`,
    entityId: sub._id.toString(),
    entityType: 'subscription',
  });

  return sub;
}

export async function cancelSubscription(id: string, notes?: string) {
  await connectToDatabase();
  const sub = await Subscription.findById(id);
  if (!sub) throw new Error('Subscription not found');
  if (sub.status === 'cancelled') throw new Error('Subscription is already cancelled');

  sub.status = 'cancelled';
  sub.cancelledAt = new Date();
  sub.nextBillingDate = null;
  sub.history.push({
    date: new Date(),
    action: 'cancelled',
    notes: notes || 'Subscription cancelled',
  });

  await sub.save();

  await logActivity({
    type: 'subscription_cancelled',
    title: 'Subscription Cancelled',
    description: `Subscription ${sub.subscriptionId} was cancelled`,
    entityId: sub._id.toString(),
    entityType: 'subscription',
  });

  return sub;
}

export async function changeSubscriptionPlan(
  id: string,
  newPlanId: string,
  notes?: string
) {
  await connectToDatabase();
  const sub = await Subscription.findById(id);
  if (!sub) throw new Error('Subscription not found');
  if (sub.status === 'cancelled') throw new Error('Cannot change plan on a cancelled subscription');

  const newPlan = await PricingPlan.findById(newPlanId);
  if (!newPlan) throw new Error('New pricing plan not found');
  if (!newPlan.isActive) throw new Error('Cannot switch to an inactive pricing plan');

  const oldPlanId = sub.pricingPlanId;
  const previousAmount = sub.amount;

  sub.pricingPlanId = newPlan._id;
  sub.amount = newPlan.amount;
  sub.currency = newPlan.currency;
  sub.billingInterval = newPlan.billingInterval;

  // Recalculate next billing date from now
  const now = new Date();
  sub.nextBillingDate = calculateNextBillingDate(now, newPlan.billingInterval, newPlan.billingIntervalCount);

  sub.history.push({
    date: now,
    action: 'plan_changed',
    notes: notes || `Plan changed to ${newPlan.name} ($${previousAmount} -> $${newPlan.amount})`,
    previousPlanId: oldPlanId,
    newPlanId: newPlan._id,
  });

  await sub.save();

  await logActivity({
    type: 'subscription_changed',
    title: 'Subscription Plan Changed',
    description: `Subscription ${sub.subscriptionId} updated to plan ${newPlan.name}`,
    entityId: sub._id.toString(),
    entityType: 'subscription',
  });

  return sub;
}

export async function simulateRenewal(id: string) {
  await connectToDatabase();
  const sub = await Subscription.findById(id)
    .populate('customerId')
    .populate('productId')
    .populate('pricingPlanId');

  if (!sub) throw new Error('Subscription not found');
  if (sub.status !== 'active') {
    throw new Error(`Cannot renew subscription with status: ${sub.status}. Subscription must be active.`);
  }

  const customer = sub.customerId as unknown as { _id: mongoose.Types.ObjectId; fullName: string };
  const product = sub.productId as unknown as { name: string };
  const plan = sub.pricingPlanId as unknown as {
    name: string;
    amount: number;
    billingInterval: 'monthly' | 'yearly' | 'one-time';
    billingIntervalCount: number;
  };

  const settings = await BusinessSettings.findOne();
  const dueDays = settings?.defaultPaymentDueDays || 15;
  const prefix = settings?.invoicePrefix || 'INV';
  const taxRate = settings?.defaultTaxPercentage || 0;

  const invCount = await Invoice.countDocuments();
  const invoiceNumber = `${prefix}-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, '0')}`;

  const issueDate = sub.nextBillingDate ? new Date(sub.nextBillingDate) : new Date();
  const dueDate = addDays(issueDate, dueDays);

  const lineItems = [
    {
      description: `Renewal: ${product.name} - ${plan.name} (${sub.billingInterval})`,
      quantity: 1,
      unitPrice: sub.amount,
      amount: sub.amount,
    },
  ];

  const calc = calculateInvoice(lineItems, 'percentage', 0, taxRate);

  const invoice = await Invoice.create({
    invoiceNumber,
    customerId: customer._id,
    subscriptionId: sub._id,
    issueDate,
    dueDate,
    lineItems: calc.lineItems,
    subtotal: calc.subtotal,
    discountType: 'percentage',
    discountValue: 0,
    discountAmount: 0,
    taxableAmount: calc.taxableAmount,
    taxRate,
    taxAmount: calc.taxAmount,
    totalAmount: calc.totalAmount,
    paidAmount: 0,
    balance: calc.totalAmount,
    currency: sub.currency,
    status: 'pending',
    notes: `Renewal invoice for ${sub.subscriptionId}`,
  });

  // Advance next billing date
  sub.nextBillingDate = calculateNextBillingDate(
    issueDate,
    sub.billingInterval,
    plan.billingIntervalCount || 1
  );

  sub.history.push({
    date: new Date(),
    action: 'renewed',
    notes: `Simulated renewal processed. Invoice ${invoiceNumber} created.`,
  });

  await sub.save();

  await logActivity({
    type: 'invoice_generated',
    title: 'Subscription Renewal Invoice Generated',
    description: `Renewal invoice ${invoiceNumber} issued for subscription ${sub.subscriptionId}`,
    entityId: invoice._id.toString(),
    entityType: 'invoice',
  });

  return { subscription: sub, invoice };
}

