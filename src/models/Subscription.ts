import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriptionHistoryItem {
  date: Date;
  action: 'created' | 'paused' | 'resumed' | 'cancelled' | 'plan_changed' | 'renewed';
  notes?: string;
  previousPlanId?: mongoose.Types.ObjectId;
  newPlanId?: mongoose.Types.ObjectId;
}

export interface ISubscriptionDocument extends Document {
  subscriptionId: string;
  customerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  pricingPlanId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  billingInterval: 'monthly' | 'yearly' | 'one-time';
  startDate: Date;
  nextBillingDate?: Date | null;
  endDate?: Date | null;
  cancelledAt?: Date | null;
  status: 'active' | 'paused' | 'cancelled' | 'past_due';
  history: ISubscriptionHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    subscriptionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    pricingPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'PricingPlan',
      required: [true, 'Pricing Plan ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
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
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    nextBillingDate: {
      type: Date,
      default: null,
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'past_due'],
      default: 'active',
      index: true,
    },
    history: [
      {
        date: { type: Date, default: Date.now },
        action: {
          type: String,
          enum: ['created', 'paused', 'resumed', 'cancelled', 'plan_changed', 'renewed'],
          required: true,
        },
        notes: { type: String, default: '' },
        previousPlanId: { type: Schema.Types.ObjectId, ref: 'PricingPlan' },
        newPlanId: { type: Schema.Types.ObjectId, ref: 'PricingPlan' },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Subscription: Model<ISubscriptionDocument> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);

export default Subscription;

