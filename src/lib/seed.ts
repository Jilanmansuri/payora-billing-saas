import connectToDatabase from './mongodb';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import PricingPlan from '@/models/PricingPlan';
import Subscription from '@/models/Subscription';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import Activity from '@/models/Activity';
import BusinessSettings from '@/models/BusinessSettings';
import { calculateInvoice, calculateNextBillingDate } from './utils';
import { subDays, subMonths, addDays } from 'date-fns';

export async function seedDatabase(dropExisting = false) {
  await connectToDatabase();

  if (dropExisting) {
    await Promise.all([
      Customer.deleteMany({}),
      Product.deleteMany({}),
      PricingPlan.deleteMany({}),
      Subscription.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Activity.deleteMany({}),
      BusinessSettings.deleteMany({}),
    ]);
  } else {
    const existingCust = await Customer.countDocuments();
    if (existingCust > 0) {
      return { message: 'Database already contains data. Skipped seed.' };
    }
  }

  // 1. Business Settings
  const settings = await BusinessSettings.create({
    businessName: 'Billora Cloud Inc.',
    businessEmail: 'billing@billora.io',
    businessPhone: '+1 (555) 019-2834',
    businessAddress: '100 Innovation Way, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    postalCode: '94107',
    defaultCurrency: 'USD',
    defaultTaxPercentage: 10,
    invoicePrefix: 'INV',
    defaultPaymentDueDays: 15,
  });

  // 2. 15 Sample Customers
  const customerData = [
    { fullName: 'Sarah Jenkins', email: 'sarah.j@acmeops.io', companyName: 'Acme Operations', phoneNumber: '+1 (415) 555-0101', billingAddress: '742 Evergreen Terrace', city: 'Springfield', state: 'OR', country: 'United States', postalCode: '97477' },
    { fullName: 'David Rodriguez', email: 'david@nexusscale.co', companyName: 'Nexus Scale Inc.', phoneNumber: '+1 (212) 555-0142', billingAddress: '350 5th Avenue', city: 'New York', state: 'NY', country: 'United States', postalCode: '10118' },
    { fullName: 'Elena Rostova', email: 'elena@vortexai.tech', companyName: 'Vortex AI Labs', phoneNumber: '+1 (650) 555-0199', billingAddress: '1600 Amphitheatre Pkwy', city: 'Mountain View', state: 'CA', country: 'United States', postalCode: '94043' },
    { fullName: 'Marcus Vance', email: 'marcus@hyperflux.dev', companyName: 'HyperFlux Systems', phoneNumber: '+1 (312) 555-0177', billingAddress: '233 S Wacker Dr', city: 'Chicago', state: 'IL', country: 'United States', postalCode: '60606' },
    { fullName: 'Chloe Dupont', email: 'chloe@aerocrest.com', companyName: 'AeroCrest Dynamics', phoneNumber: '+1 (206) 555-0163', billingAddress: '400 Pine St', city: 'Seattle', state: 'WA', country: 'United States', postalCode: '98101' },
    { fullName: 'Liam O’Connor', email: 'liam@celticloud.ie', companyName: 'Celtic Cloud Ltd', phoneNumber: '+353 (1) 496-0123', billingAddress: 'Grand Canal Dock', city: 'Dublin', state: 'Leinster', country: 'Ireland', postalCode: 'D02 X525' },
    { fullName: 'Priya Sharma', email: 'priya@zenithpulse.io', companyName: 'ZenithPulse Analytics', phoneNumber: '+1 (512) 555-0184', billingAddress: '500 W 2nd St', city: 'Austin', state: 'TX', country: 'United States', postalCode: '78701' },
    { fullName: 'Alexander Wright', email: 'alex@luminaforge.design', companyName: 'Lumina Forge Studio', phoneNumber: '+44 (20) 7946-0182', billingAddress: '25 Bank Street', city: 'London', state: 'Greater London', country: 'United Kingdom', postalCode: 'E14 5JP' },
    { fullName: 'Hannah Becker', email: 'hannah@berlinfin.de', companyName: 'Berlin Fintech GmbH', phoneNumber: '+49 (30) 2018-0190', billingAddress: 'Friedrichstraße 120', city: 'Berlin', state: 'Berlin', country: 'Germany', postalCode: '10117' },
    { fullName: 'Kenji Takahashi', email: 'kenji@tokyoventures.jp', companyName: 'Tokyo Ventures KK', phoneNumber: '+81 (3) 5555-0144', billingAddress: '6-10-1 Roppongi', city: 'Minato-ku', state: 'Tokyo', country: 'Japan', postalCode: '106-6108' },
    { fullName: 'Sophia Martinez', email: 'sophia@solargrid.es', companyName: 'SolarGrid Solutions', phoneNumber: '+34 (91) 555-0132', billingAddress: 'Paseo de la Castellana 89', city: 'Madrid', state: 'Madrid', country: 'Spain', postalCode: '28046' },
    { fullName: 'Benjamin Hayes', email: 'benjamin@apexmetrics.com', companyName: 'Apex Metrics', phoneNumber: '+1 (617) 555-0158', billingAddress: '100 Federal St', city: 'Boston', state: 'MA', country: 'United States', postalCode: '02110' },
    { fullName: 'Amira Al-Mansoor', email: 'amira@dubaiscale.ae', companyName: 'Dubai Scale Partners', phoneNumber: '+971 (4) 301-0100', billingAddress: 'DIFC Gate Precinct 4', city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', postalCode: '507211' },
    { fullName: 'Lucas Silva', email: 'lucas@paulistatech.br', companyName: 'Paulista Tech Brasil', phoneNumber: '+55 (11) 3255-0176', billingAddress: 'Av. Paulista 1000', city: 'São Paulo', state: 'SP', country: 'Brazil', postalCode: '01310-100' },
    { fullName: 'Claire Sterling', email: 'claire@sterlingflow.ca', companyName: 'Sterling Flow Inc.', phoneNumber: '+1 (416) 555-0191', billingAddress: '181 Bay St', city: 'Toronto', state: 'ON', country: 'Canada', postalCode: 'M5J 2T3' },
  ];

  const customers = await Customer.insertMany(customerData);

  // 3. 8 Products
  const productData = [
    { name: 'Billora Analytics Suite', description: 'Enterprise-grade financial analytics, churn modeling, and revenue forecasting.', category: 'Analytics', status: 'active' },
    { name: 'Billora Billing Engine', description: 'Complete subscription lifecycles, automated invoicing, and dunning engine.', category: 'Billing', status: 'active' },
    { name: 'Billora Customer Portal', description: 'Self-serve billing portal for customers to manage cards and download invoices.', category: 'Customer Portal', status: 'active' },
    { name: 'Billora Revenue Recognition', description: 'ASC 606 and IFRS 15 compliant automated revenue recognition reporting.', category: 'Compliance', status: 'active' },
    { name: 'Billora Webhook & Event Stream', description: 'Real-time billing event streams with HMAC signing and retry queues.', category: 'Developer Tools', status: 'active' },
    { name: 'Billora Tax Compliance Hub', description: 'Automated global sales tax, VAT, and GST calculation with regional filing.', category: 'Tax & Compliance', status: 'active' },
    { name: 'Billora Dedicated Account Manager', description: 'Quarterly business reviews, SLA guarantees, and priority support.', category: 'Support & Services', status: 'active' },
    { name: 'Billora Legacy Importer Tool', description: 'Legacy data migration toolkit for Stripe, Chargebee, and Recurly.', category: 'Migration Tools', status: 'archived' },
  ];

  const products = await Product.insertMany(productData);

  // 4. 12 Pricing Plans
  const plansData = [
    // Billing Engine plans
    { name: 'Starter Monthly', productId: products[1]._id, amount: 49, currency: 'USD', billingInterval: 'monthly', billingIntervalCount: 1, isActive: true, description: 'Up to $10k monthly billing volume.' },
    { name: 'Growth Monthly', productId: products[1]._id, amount: 149, currency: 'USD', billingInterval: 'monthly', billingIntervalCount: 1, isActive: true, description: 'Up to $100k monthly billing volume with priority webhooks.' },
    { name: 'Enterprise Yearly', productId: products[1]._id, amount: 1490, currency: 'USD', billingInterval: 'yearly', billingIntervalCount: 1, isActive: true, description: 'Unlimited billing volume, 2 months free per year.' },
    // Analytics Suite plans
    { name: 'Analytics Pro Monthly', productId: products[0]._id, amount: 99, currency: 'USD', billingInterval: 'monthly', billingIntervalCount: 1, isActive: true, description: 'Full cohort analysis and MRR waterfalls.' },
    { name: 'Analytics Enterprise Annual', productId: products[0]._id, amount: 990, currency: 'USD', billingInterval: 'yearly', billingIntervalCount: 1, isActive: true, description: 'Custom data warehouse exports and BigQuery sync.' },
    // Customer Portal plans
    { name: 'White-Label Portal Monthly', productId: products[2]._id, amount: 79, currency: 'USD', billingInterval: 'monthly', billingIntervalCount: 1, isActive: true, description: 'Custom domain and branded customer dashboard.' },
    // Revenue Recognition plans
    { name: 'ASC 606 Module Annual', productId: products[3]._id, amount: 2400, currency: 'USD', billingInterval: 'yearly', billingIntervalCount: 1, isActive: true, description: 'Automated deferred revenue schedules.' },
    // Webhook plans
    { name: 'Event Stream Add-on', productId: products[4]._id, amount: 29, currency: 'USD', billingInterval: 'monthly', billingIntervalCount: 1, isActive: true, description: '1M event dispatches per month.' },
    // Tax Compliance plans
    { name: 'Global Tax Engine Monthly', productId: products[5]._id, amount: 119, currency: 'USD', billingInterval: 'monthly', billingIntervalCount: 1, isActive: true, description: 'Real-time multi-jurisdiction tax calculation.' },
    { name: 'Global Tax Engine Annual', productId: products[5]._id, amount: 1190, currency: 'USD', billingInterval: 'yearly', billingIntervalCount: 1, isActive: true, description: 'Includes annual filing audit reports.' },
    // Support & Services plans
    { name: 'Priority Support Retainer', productId: products[6]._id, amount: 499, currency: 'USD', billingInterval: 'monthly', billingIntervalCount: 1, isActive: true, description: '1-hour SLA 24/7 emergency hotline.' },
    // One-time setup
    { name: 'Concierge Onboarding', productId: products[6]._id, amount: 1500, currency: 'USD', billingInterval: 'one-time', billingIntervalCount: 1, isActive: true, description: 'Dedicated implementation specialist setup.' },
  ];

  const plans = await PricingPlan.insertMany(plansData);

  // 5. 20 Subscriptions across customers and plans
  const subSpecs = [
    { custIdx: 0, planIdx: 1, status: 'active', monthsAgo: 5 },
    { custIdx: 0, planIdx: 3, status: 'active', monthsAgo: 4 },
    { custIdx: 1, planIdx: 2, status: 'active', monthsAgo: 8 },
    { custIdx: 2, planIdx: 4, status: 'active', monthsAgo: 6 },
    { custIdx: 2, planIdx: 1, status: 'active', monthsAgo: 3 },
    { custIdx: 3, planIdx: 0, status: 'paused', monthsAgo: 7 },
    { custIdx: 4, planIdx: 1, status: 'active', monthsAgo: 4 },
    { custIdx: 4, planIdx: 5, status: 'active', monthsAgo: 2 },
    { custIdx: 5, planIdx: 2, status: 'active', monthsAgo: 9 },
    { custIdx: 6, planIdx: 3, status: 'active', monthsAgo: 5 },
    { custIdx: 7, planIdx: 1, status: 'cancelled', monthsAgo: 6 },
    { custIdx: 8, planIdx: 8, status: 'active', monthsAgo: 4 },
    { custIdx: 8, planIdx: 1, status: 'active', monthsAgo: 4 },
    { custIdx: 9, planIdx: 2, status: 'active', monthsAgo: 10 },
    { custIdx: 10, planIdx: 0, status: 'past_due', monthsAgo: 3 },
    { custIdx: 11, planIdx: 1, status: 'active', monthsAgo: 2 },
    { custIdx: 11, planIdx: 3, status: 'active', monthsAgo: 2 },
    { custIdx: 12, planIdx: 6, status: 'active', monthsAgo: 7 },
    { custIdx: 13, planIdx: 0, status: 'active', monthsAgo: 1 },
    { custIdx: 14, planIdx: 1, status: 'active', monthsAgo: 3 },
  ];

  const subscriptionsToCreate = subSpecs.map((spec, i) => {
    const cust = customers[spec.custIdx];
    const plan = plans[spec.planIdx];
    const start = subMonths(new Date(), spec.monthsAgo);
    let nextBilling: Date | null = null;
    let cancelledAt: Date | null = null;

    if (spec.status === 'active') {
      nextBilling = addDays(new Date(), (i % 25) + 3);
    } else if (spec.status === 'paused') {
      nextBilling = addDays(new Date(), 20);
    } else if (spec.status === 'past_due') {
      nextBilling = subDays(new Date(), 4);
    } else if (spec.status === 'cancelled') {
      cancelledAt = subDays(new Date(), 15);
    }

    return {
      subscriptionId: `SUB-${1001 + i}`,
      customerId: cust._id,
      productId: plan.productId,
      pricingPlanId: plan._id,
      amount: plan.amount,
      currency: plan.currency,
      billingInterval: plan.billingInterval,
      startDate: start,
      nextBillingDate: nextBilling,
      cancelledAt,
      status: spec.status as 'active' | 'paused' | 'cancelled' | 'past_due',
      history: [
        {
          date: start,
          action: 'created' as const,
          notes: `Subscribed to ${plan.name}`,
          newPlanId: plan._id,
        },
        ...(spec.status === 'paused'
          ? [{ date: subDays(new Date(), 10), action: 'paused' as const, notes: 'Paused temporarily upon customer request' }]
          : []),
        ...(spec.status === 'cancelled'
          ? [{ date: subDays(new Date(), 15), action: 'cancelled' as const, notes: 'Cancelled due to internal restructuring' }]
          : []),
      ],
    };
  });

  const subscriptions = await Subscription.insertMany(subscriptionsToCreate);

  // 6. 30 Invoices
  // Mix of historical paid invoices, recent pending invoices, and 2 overdue invoices
  const invoicesToCreate = [];
  let invCounter = 1001;

  for (let i = 0; i < 30; i++) {
    const cust = customers[i % customers.length];
    const sub = subscriptions[i % subscriptions.length];
    const plan = plans[i % plans.length];

    const isOverdue = i === 28 || i === 29;
    const isPending = i >= 23 && i <= 27;
    const isPaid = i < 23;

    const daysAgo = isOverdue ? 45 : isPending ? 8 : (30 - i) * 3;
    const issueDate = subDays(new Date(), daysAgo);
    const dueDate = isOverdue ? subDays(new Date(), 15) : addDays(issueDate, 15);

    const lineItems = [
      {
        description: `${plan.name} Subscription Service`,
        quantity: 1,
        unitPrice: plan.amount,
        amount: plan.amount,
      },
      ...(i % 4 === 0
        ? [
            {
              description: 'Overage API Dispatches (10k units)',
              quantity: 2,
              unitPrice: 15,
              amount: 30,
            },
          ]
        : []),
    ];

    const calc = calculateInvoice(lineItems, 'percentage', i % 5 === 0 ? 10 : 0, 10);
    const totalAmount = calc.totalAmount;
    const paidAmount = isPaid ? totalAmount : isPending && i === 25 ? Math.round(totalAmount / 2) : 0;
    const balance = Math.max(0, totalAmount - paidAmount);
    const status = isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending';

    invoicesToCreate.push({
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invCounter++).padStart(4, '0')}`,
      customerId: cust._id,
      subscriptionId: sub._id,
      issueDate,
      dueDate,
      lineItems: calc.lineItems,
      subtotal: calc.subtotal,
      discountType: (i % 5 === 0 ? 'percentage' : 'fixed') as 'percentage' | 'fixed',
      discountValue: i % 5 === 0 ? 10 : 0,
      discountAmount: calc.discountAmount,
      taxableAmount: calc.taxableAmount,
      taxRate: 10,
      taxAmount: calc.taxAmount,
      totalAmount,
      paidAmount,
      balance,
      currency: 'USD',
      status: status as 'draft' | 'pending' | 'paid' | 'overdue',
      notes: `Invoice for ${cust.fullName} - ${plan.name}`,
    });
  }

  const invoices = await Invoice.insertMany(invoicesToCreate);

  // 7. 35 Payment Records
  const paymentMethods: ('card' | 'bank_transfer' | 'upi' | 'cash')[] = ['card', 'bank_transfer', 'upi', 'card'];
  const paymentsToCreate = [];
  let payCounter = 1001;

  // Paid invoices full payments (23 payments)
  for (let i = 0; i < 23; i++) {
    const inv = invoices[i];
    paymentsToCreate.push({
      paymentId: `PAY-${payCounter++}`,
      invoiceId: inv._id,
      customerId: inv.customerId,
      amount: inv.totalAmount,
      paymentDate: addDays(new Date(inv.issueDate), (i % 5) + 1),
      paymentMethod: paymentMethods[i % paymentMethods.length],
      paymentStatus: 'successful' as const,
      transactionReference: `TXN-BILLORA-${789000 + i}`,
      notes: 'Full payment received.',
    });
  }

  // Partial payment on invoice index 25
  const partialInv = invoices[25];
  paymentsToCreate.push({
    paymentId: `PAY-${payCounter++}`,
    invoiceId: partialInv._id,
    customerId: partialInv.customerId,
    amount: partialInv.paidAmount,
    paymentDate: subDays(new Date(), 2),
    paymentMethod: 'bank_transfer' as const,
    paymentStatus: 'successful' as const,
    transactionReference: `TXN-BILLORA-${789901}`,
    notes: 'Partial deposit payment received.',
  });

  // Additional historical simulated payments across past months to enrich revenue trends
  for (let i = 0; i < 11; i++) {
    const inv = invoices[i % 15];
    const isSuccess = i < 9;
    const isPending = i === 9;
    const isFailed = i === 10;
    const status = isSuccess ? 'successful' : isPending ? 'pending' : 'failed';

    paymentsToCreate.push({
      paymentId: `PAY-${payCounter++}`,
      invoiceId: inv._id,
      customerId: inv.customerId,
      amount: isFailed ? 149 : isPending ? 99 : 49,
      paymentDate: subDays(new Date(), (11 - i) * 4),
      paymentMethod: paymentMethods[(i + 1) % paymentMethods.length],
      paymentStatus: status as 'successful' | 'pending' | 'failed',
      transactionReference: `TXN-BILLORA-${790000 + i}`,
      notes: isFailed ? 'Card payment declined by issuer.' : isPending ? 'Wire transfer settlement in flight.' : 'Recurring billing charge.',
    });
  }

  await Payment.insertMany(paymentsToCreate);

  // 8. Sample Activity Logs
  const activities = [
    { type: 'customer_created' as const, title: 'Customer Onboarded', description: 'Sarah Jenkins (Acme Operations) registered.', createdAt: subDays(new Date(), 150) },
    { type: 'subscription_created' as const, title: 'Enterprise Subscription Activated', description: 'Nexus Scale Inc. subscribed to Enterprise Yearly ($1,490/yr).', createdAt: subDays(new Date(), 120) },
    { type: 'invoice_generated' as const, title: 'Invoice Issued', description: 'Invoice INV-2026-1015 generated for Vortex AI Labs.', createdAt: subDays(new Date(), 20) },
    { type: 'payment_recorded' as const, title: 'Payment Confirmed', description: 'Payment PAY-1012 of $1,490 received via Bank Transfer.', createdAt: subDays(new Date(), 10) },
    { type: 'subscription_paused' as const, title: 'Subscription Paused', description: 'Subscription SUB-1006 for HyperFlux Systems paused per user request.', createdAt: subDays(new Date(), 5) },
    { type: 'payment_recorded' as const, title: 'Partial Payment Logged', description: 'Payment PAY-1024 of $81.95 recorded for Berlin Fintech GmbH.', createdAt: subDays(new Date(), 2) },
    { type: 'invoice_generated' as const, title: 'Renewal Invoiced', description: 'Invoice INV-2026-1028 created for Celtic Cloud Ltd.', createdAt: subDays(new Date(), 1) },
  ];

  await Activity.insertMany(activities);

  return {
    success: true,
    message: 'Billora sample dataset successfully seeded!',
    summary: {
      customers: customers.length,
      products: products.length,
      plans: plans.length,
      subscriptions: subscriptions.length,
      invoices: invoices.length,
      payments: paymentsToCreate.length,
    },
  };
}

