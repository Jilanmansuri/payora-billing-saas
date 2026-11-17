import connectToDatabase from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Subscription from '@/models/Subscription';
import Customer from '@/models/Customer';
import Invoice from '@/models/Invoice';
import Product from '@/models/Product';
import { roundToTwo } from '@/lib/utils';
import { subDays, subMonths, subYears, startOfDay } from 'date-fns';

export interface AnalyticsFilterParams {
  range?: '7d' | '30d' | '3m' | '6m' | '12m' | 'all';
  startDate?: string;
  endDate?: string;
}

export async function getAnalyticsData(params: AnalyticsFilterParams = {}) {
  await connectToDatabase();

  const now = new Date();
  let fromDate: Date = subDays(now, 30);

  if (params.range === '7d') fromDate = subDays(now, 7);
  else if (params.range === '30d') fromDate = subDays(now, 30);
  else if (params.range === '3m') fromDate = subMonths(now, 3);
  else if (params.range === '6m') fromDate = subMonths(now, 6);
  else if (params.range === '12m') fromDate = subYears(now, 1);
  else if (params.range === 'all') fromDate = new Date(0);
  else if (params.startDate) fromDate = new Date(params.startDate);

  const toDate = params.endDate ? new Date(params.endDate) : now;

  const [
    revenueResult,
    totalPaymentsCount,
    successfulPaymentsCount,
    activeSubsList,
    customerCount,
    outstandingInvoices,
    paymentMethodDist,
    paymentStatusDist,
    invoiceStatusDist,
    revenueByIntervalDist,
    revenueTrendDaily,
  ] = await Promise.all([
    // Revenue in date range
    Payment.aggregate([
      {
        $match: {
          paymentStatus: 'successful',
          paymentDate: { $gte: fromDate, $lte: toDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // Total payments count in range
    Payment.countDocuments({ paymentDate: { $gte: fromDate, $lte: toDate } }),
    // Successful payments count in range
    Payment.countDocuments({
      paymentStatus: 'successful',
      paymentDate: { $gte: fromDate, $lte: toDate },
    }),
    // Active subs
    Subscription.find({ status: 'active' }).select('amount billingInterval').lean(),
    // Customers count
    Customer.countDocuments({ isArchived: false }),
    // Outstanding balance
    Invoice.aggregate([
      { $match: { status: { $in: ['pending', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ]),
    // Payment method distribution
    Payment.aggregate([
      {
        $match: {
          paymentStatus: 'successful',
          paymentDate: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    // Payment status distribution
    Payment.aggregate([
      { $match: { paymentDate: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
        },
      },
    ]),
    // Invoice status distribution
    Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' },
        },
      },
    ]),
    // Revenue by interval from active subscriptions
    Subscription.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$billingInterval',
          totalAnnualized: {
            $sum: {
              $cond: [
                { $eq: ['$billingInterval', 'monthly'] },
                { $multiply: ['$amount', 12] },
                '$amount',
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    // Revenue trend daily / monthly
    Payment.aggregate([
      {
        $match: {
          paymentStatus: 'successful',
          paymentDate: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;
  const paymentSuccessRate =
    totalPaymentsCount > 0 ? roundToTwo((successfulPaymentsCount / totalPaymentsCount) * 100) : 100;

  let mrr = 0;
  activeSubsList.forEach((s) => {
    if (s.billingInterval === 'monthly') mrr += s.amount;
    else if (s.billingInterval === 'yearly') mrr += s.amount / 12;
  });
  mrr = roundToTwo(mrr);

  const arpu = customerCount > 0 ? roundToTwo(totalRevenue / customerCount) : 0;
  const outstandingAmount = roundToTwo(outstandingInvoices[0]?.total || 0);

  // Revenue by product aggregation
  const subscriptions = await Subscription.find({ status: 'active' }).populate('productId').lean();
  const productRevMap = new Map<string, number>();

  subscriptions.forEach((sub) => {
    const prod = sub.productId as unknown as { name?: string };
    const prodName = prod?.name || 'Standard Product';
    const current = productRevMap.get(prodName) || 0;
    const monthlyAmt = sub.billingInterval === 'yearly' ? sub.amount / 12 : sub.amount;
    productRevMap.set(prodName, current + monthlyAmt);
  });

  const revenueByProduct = Array.from(productRevMap.entries()).map(([name, value]) => ({
    name,
    value: roundToTwo(value),
  }));

  return {
    metrics: {
      totalRevenue: roundToTwo(totalRevenue),
      mrr,
      yearlyRunRate: roundToTwo(mrr * 12),
      arpu,
      activeSubscriptionsCount: activeSubsList.length,
      customerCount,
      paymentSuccessRate,
      outstandingAmount,
    },
    revenueTrend: revenueTrendDaily.map((d) => ({
      date: d._id,
      revenue: roundToTwo(d.revenue),
      count: d.count,
    })),
    paymentMethods: paymentMethodDist.map((m) => ({
      method: m._id,
      revenue: roundToTwo(m.revenue),
      count: m.count,
    })),
    paymentStatuses: paymentStatusDist.map((s) => ({
      status: s._id,
      count: s.count,
    })),
    invoiceStatuses: invoiceStatusDist.map((i) => ({
      status: i._id,
      count: i.count,
      amount: roundToTwo(i.amount),
    })),
    revenueByInterval: revenueByIntervalDist.map((r) => ({
      interval: r._id,
      totalAnnualized: roundToTwo(r.totalAnnualized),
      count: r.count,
    })),
    revenueByProduct,
  };
}

