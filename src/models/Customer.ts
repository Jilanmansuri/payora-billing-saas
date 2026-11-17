import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomerDocument extends Document {
  fullName: string;
  email: string;
  phoneNumber?: string;
  companyName?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomerDocument>(
  {
    fullName: {
      type: String,
      required: [true, 'Customer full name is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    billingAddress: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: 'United States',
    },
    postalCode: {
      type: String,
      trim: true,
      default: '',
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CustomerSchema.index({ fullName: 'text', email: 'text', companyName: 'text' });

export const Customer: Model<ICustomerDocument> =
  mongoose.models.Customer || mongoose.model<ICustomerDocument>('Customer', CustomerSchema);

export default Customer;

