import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Subscription from '@/models/Subscription';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import { logActivity } from './activity.service';
import mongoose from 'mongoose';

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isArchived?: boolean;
}

export async function getCustomers(params: CustomerQueryParams = {}) {
  await connectToDatabase();
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  if (typeof params.isArchived === 'boolean') {
    query.isArchived = params.isArchived;
  } else {
    query.isArchived = false;
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    query.$or = [
      { fullName: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { companyName: { $regex: s, $options: 'i' } },
    ];
  }

  const sortField = params.sortBy || 'createdAt';
  const sortDirection = params.sortOrder === 'asc' ? 1 : -1;
  const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

  const [customers, total] = await Promise.all([
    Customer.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
    Customer.countDocuments(query),
  ]);

  // Aggregate financial summary for each customer in current page
  const customerIds = customers.map((c) => c._id);

  const [paymentTotals, activeSubs, invoiceStats] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          customerId: { $in: customerIds },
          paymentStatus: 'successful',
        },
      },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]),
    Subscription.aggregate([
      {
        $match: {
          customerId: { $in: customerIds },
          status: 'active',
        },
      },
      {
        $group: {
          _id: '$customerId',
          activeCount: { $sum: 1 },
        },
      },
    ]),
    Invoice.aggregate([
      {
        $match: {
          customerId: { $in: customerIds },
        },
      },
      {
        $group: {
          _id: '$customerId',
          invoicesCount: { $sum: 1 },
          unpaidBalance: {
            $sum: {
              $cond: [{ $in: ['$status', ['pending', 'overdue']] }, '$balance', 0],
            },
          },
        },
      },
    ]),
  ]);

  const spendingMap = new Map(paymentTotals.map((p) => [p._id.toString(), p.totalSpent]));
  const activeSubsMap = new Map(activeSubs.map((s) => [s._id.toString(), s.activeCount]));
  const invoiceStatsMap = new Map(
    invoiceStats.map((i) => [i._id.toString(), { count: i.invoicesCount, unpaid: i.unpaidBalance }])
  );

  const enriched = customers.map((c) => {
    const idStr = c._id.toString();
    const inv = invoiceStatsMap.get(idStr) || { count: 0, unpaid: 0 };
    return {
      ...c,
      totalSpent: spendingMap.get(idStr) || 0,
      activeSubscriptionsCount: activeSubsMap.get(idStr) || 0,
      invoicesCount: inv.count,
      unpaidBalance: inv.unpaid,
    };
  });

  return {
    data: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getCustomerById(id: string) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const customer = await Customer.findById(id).lean();
  if (!customer) return null;

  const [subscriptions, invoices, payments, totalSpentResult, unpaidResult] =
    await Promise.all([
      Subscription.find({ customerId: id })
        .populate('productId')
        .populate('pricingPlanId')
        .sort({ createdAt: -1 })
        .lean(),
      Invoice.find({ customerId: id }).sort({ issueDate: -1 }).lean(),
      Payment.find({ customerId: id })
        .populate('invoiceId')
        .sort({ paymentDate: -1 })
        .lean(),
      Payment.aggregate([
        { $match: { customerId: new mongoose.Types.ObjectId(id), paymentStatus: 'successful' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Invoice.aggregate([
        {
          $match: {
            customerId: new mongoose.Types.ObjectId(id),
            status: { $in: ['pending', 'overdue'] },
          },
        },
        { $group: { _id: null, unpaid: { $sum: '$balance' } } },
      ]),
    ]);

  const activeSubscriptionsCount = subscriptions.filter((s) => s.status === 'active').length;
  const totalSpent = totalSpentResult[0]?.total || 0;
  const unpaidBalance = unpaidResult[0]?.unpaid || 0;

  return {
    ...customer,
    totalSpent,
    unpaidBalance,
    activeSubscriptionsCount,
    invoicesCount: invoices.length,
    subscriptions,
    invoices,
    payments,
  };
}

export async function createCustomer(data: Record<string, unknown>) {
  await connectToDatabase();

  const existing = await Customer.findOne({ email: String(data.email).toLowerCase() });
  if (existing) {
    throw new Error('A customer with this email address already exists');
  }

  const customer = await Customer.create({
    ...data,
    email: String(data.email).toLowerCase(),
  });

  await logActivity({
    type: 'customer_created',
    title: 'New Customer Registered',
    description: `Customer ${customer.fullName} (${customer.email}) was added`,
    entityId: customer._id.toString(),
    entityType: 'customer',
  });

  return customer;
}

export async function updateCustomer(id: string, data: Record<string, unknown>) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid customer ID');
  }

  if (data.email) {
    const existing = await Customer.findOne({
      email: String(data.email).toLowerCase(),
      _id: { $ne: id },
    });
    if (existing) {
      throw new Error('Another customer with this email address already exists');
    }
  }

  const customer = await Customer.findByIdAndUpdate(
    id,
    { ...data, ...(data.email ? { email: String(data.email).toLowerCase() } : {}) },
    { new: true, runValidators: true }
  );

  return customer;
}

export async function deleteCustomer(id: string) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid customer ID');
  }

  // Check financial and subscription dependencies
  const activeSubsCount = await Subscription.countDocuments({
    customerId: id,
    status: { $in: ['active', 'paused'] },
  });

  const unpaidInvoicesCount = await Invoice.countDocuments({
    customerId: id,
    status: { $in: ['pending', 'overdue'] },
  });

  if (activeSubsCount > 0 || unpaidInvoicesCount > 0) {
    // Safe archival instead of breaking financial integrity
    await Customer.findByIdAndUpdate(id, { isArchived: true });
    return {
      archived: true,
      message:
        'Customer has active subscriptions or outstanding balances and was safely archived instead of permanently deleted.',
    };
  }

  // Safe delete if no active dependencies
  await Customer.findByIdAndUpdate(id, { isArchived: true });
  return { archived: true, message: 'Customer successfully archived.' };
}

