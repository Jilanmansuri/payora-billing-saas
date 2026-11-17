import connectToDatabase from '@/lib/mongodb';
import BusinessSettings from '@/models/BusinessSettings';

export async function getSettings() {
  await connectToDatabase();
  let settings = await BusinessSettings.findOne().lean();

  if (!settings) {
    settings = await BusinessSettings.create({
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
  }

  return settings;
}

export async function updateSettings(data: Record<string, unknown>) {
  await connectToDatabase();
  let settings = await BusinessSettings.findOne();

  if (!settings) {
    settings = await BusinessSettings.create(data);
  } else {
    Object.assign(settings, data);
    await settings.save();
  }

  return settings;
}

