import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPricingPlanDocument extends Document {
  name: string;
  productId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  billingInterval: 'monthly' | 'yearly' | 'one-time';
  billingIntervalCount: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PricingPlanSchema = new Schema<IPricingPlanDocument>(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Plan amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    billingInterval: {
      type: String,
      enum: ['monthly', 'yearly', 'one-time'],
      required: true,
      default: 'monthly',
    },
    billingIntervalCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const PricingPlan: Model<IPricingPlanDocument> =
  mongoose.models.PricingPlan ||
  mongoose.model<IPricingPlanDocument>('PricingPlan', PricingPlanSchema);

export default PricingPlan;

