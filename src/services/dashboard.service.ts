import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Subscription from '@/models/Subscription';
import Customer from '@/models/Customer';
import Invoice from '@/models/Invoice';
import { roundToTwo } from '@/lib/utils';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

export async function getDashboardStats() {
  await connectToDatabase();

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  const [
    totalRevResult,
    currentMonthRevResult,
    prevMonthRevResult,
    activeSubsList,
    prevActiveSubsCount,
    totalCustomersCount,
    prevCustomersCount,
    pendingInvoicesStats,
    overdueInvoicesStats,
  ] = await Promise.all([
    // Total lifetime revenue
    Payment.aggregate([
      { $match: { paymentStatus: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // Current month revenue
    Payment.aggregate([
      {
        $match: {
          paymentStatus: 'successful',
          paymentDate: { $gte: currentMonthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // Previous month revenue
    Payment.aggregate([
      {
        $match: {
          paymentStatus: 'successful',
          paymentDate: { $gte: previousMonthStart, $lte: previousMonthEnd },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // Active subscriptions for MRR calculation
    Subscription.find({ status: 'active' }).select('amount billingInterval').lean(),
    // Previous month active subscriptions count
    Subscription.countDocuments({
      createdAt: { $lte: previousMonthEnd },
      status: 'active',
    }),
    // Customers count
    Customer.countDocuments({ isArchived: false }),
    // Previous month customers count
    Customer.countDocuments({
      createdAt: { $lte: previousMonthEnd },
      isArchived: false,
    }),
    // Pending invoices
    Invoice.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$balance' } } },
    ]),
    // Overdue invoices
    Invoice.aggregate([
      {
        $match: {
          $or: [
            { status: 'overdue' },
            { status: 'pending', dueDate: { $lt: now } },
          ],
        },
      },
      { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$balance' } } },
    ]),
  ]);

  const totalRevenue = totalRevResult[0]?.total || 0;
  const currentMonthRev = currentMonthRevResult[0]?.total || 0;
  const prevMonthRev = prevMonthRevResult[0]?.total || 0;

  const revDiff = currentMonthRev - prevMonthRev;
  const revPct = prevMonthRev > 0 ? (revDiff / prevMonthRev) * 100 : currentMonthRev > 0 ? 100 : 0;

  // Calculate MRR: normalize monthly, yearly / 12
  let currentMRR = 0;
  activeSubsList.forEach((sub) => {
    if (sub.billingInterval === 'monthly') {
      currentMRR += sub.amount;
    } else if (sub.billingInterval === 'yearly') {
      currentMRR += sub.amount / 12;
    }
  });
  currentMRR = roundToTwo(currentMRR);

  const activeSubsCount = activeSubsList.length;
  const subsDiff = activeSubsCount - prevActiveSubsCount;
  const subsPct = prevActiveSubsCount > 0 ? (subsDiff / prevActiveSubsCount) * 100 : activeSubsCount > 0 ? 100 : 0;

  const custDiff = totalCustomersCount - prevCustomersCount;
  const custPct = prevCustomersCount > 0 ? (custDiff / prevCustomersCount) * 100 : totalCustomersCount > 0 ? 100 : 0;

  return {
    totalRevenue: {
      value: roundToTwo(totalRevenue),
      changePercentage: roundToTwo(revPct),
      previousValue: roundToTwo(prevMonthRev),
    },
    mrr: {
      value: currentMRR,
      changePercentage: roundToTwo(subsPct),
      previousValue: roundToTwo(prevActiveSubsCount > 0 ? (currentMRR / (1 + (subsPct || 0) / 100)) : 0),
    },
    activeSubscriptions: {
      value: activeSubsCount,
      changePercentage: roundToTwo(subsPct),
      previousValue: prevActiveSubsCount,
    },
    totalCustomers: {
      value: totalCustomersCount,
      changePercentage: roundToTwo(custPct),
      previousValue: prevCustomersCount,
    },
    pendingInvoices: {
      value: pendingInvoicesStats[0]?.count || 0,
      amount: roundToTwo(pendingInvoicesStats[0]?.amount || 0),
    },
    overdueInvoices: {
      value: overdueInvoicesStats[0]?.count || 0,
      amount: roundToTwo(overdueInvoicesStats[0]?.amount || 0),
    },
  };
}

export async function getDashboardMonthlyRevenue(monthsCount: number = 6) {
  await connectToDatabase();
  const now = new Date();
  const startDate = startOfMonth(subMonths(now, monthsCount - 1));

  const payments = await Payment.aggregate([
    {
      $match: {
        paymentStatus: 'successful',
        paymentDate: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' },
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const result: { month: string; revenue: number; count: number }[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const targetDate = subMonths(now, i);
    const yr = targetDate.getFullYear();
    const mo = targetDate.getMonth() + 1;
    const label = `${monthNames[mo - 1]} ${yr}`;

    const match = payments.find((p) => p._id.year === yr && p._id.month === mo);
    result.push({
      month: label,
      revenue: roundToTwo(match?.revenue || 0),
      count: match?.count || 0,
    });
  }

  return result;
}

export async function getDashboardSubscriptionOverview() {
  await connectToDatabase();
  const counts = await Subscription.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const map = new Map(counts.map((c) => [c._id, c.count]));

  return [
    { status: 'Active', count: map.get('active') || 0, color: '#10b981' },
    { status: 'Paused', count: map.get('paused') || 0, color: '#f59e0b' },
    { status: 'Cancelled', count: map.get('cancelled') || 0, color: '#64748b' },
    { status: 'Past Due', count: map.get('past_due') || 0, color: '#ef4444' },
  ];
}

export async function getUpcomingRenewals(limit: number = 5) {
  await connectToDatabase();
  const now = new Date();

  return Subscription.find({
    status: 'active',
    nextBillingDate: { $gte: now },
  })
    .populate('customerId')
    .populate('productId')
    .populate('pricingPlanId')
    .sort({ nextBillingDate: 1 })
    .limit(limit)
    .lean();
}

export async function getRecentPayments(limit: number = 6) {
  await connectToDatabase();
  return Payment.find({})
    .populate('customerId')
    .populate('invoiceId')
    .sort({ paymentDate: -1 })
    .limit(limit)
    .lean();
}

