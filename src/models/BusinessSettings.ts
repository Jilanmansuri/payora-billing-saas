import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBusinessSettingsDocument extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSettingsSchema = new Schema<IBusinessSettingsDocument>(
  {
    businessName: {
      type: String,
      default: 'Billora Cloud Inc.',
      required: true,
      trim: true,
    },
    businessEmail: {
      type: String,
      default: 'billing@billora.io',
      required: true,
      trim: true,
    },
    businessPhone: {
      type: String,
      default: '+1 (555) 019-2834',
      trim: true,
    },
    businessAddress: {
      type: String,
      default: '100 Innovation Way, Suite 400',
      trim: true,
    },
    city: {
      type: String,
      default: 'San Francisco',
      trim: true,
    },
    state: {
      type: String,
      default: 'CA',
      trim: true,
    },
    country: {
      type: String,
      default: 'United States',
      trim: true,
    },
    postalCode: {
      type: String,
      default: '94107',
      trim: true,
    },
    businessLogo: {
      type: String,
      default: '',
    },
    defaultCurrency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    defaultTaxPercentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    invoicePrefix: {
      type: String,
      default: 'INV',
      trim: true,
      uppercase: true,
    },
    defaultPaymentDueDays: {
      type: Number,
      default: 15,
      min: 0,
      max: 365,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const BusinessSettings: Model<IBusinessSettingsDocument> =
  mongoose.models.BusinessSettings ||
  mongoose.model<IBusinessSettingsDocument>('BusinessSettings', BusinessSettingsSchema);

export default BusinessSettings;

