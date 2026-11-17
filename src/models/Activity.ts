import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityDocument extends Document {
  type:
    | 'customer_created'
    | 'subscription_created'
    | 'subscription_paused'
    | 'subscription_resumed'
    | 'subscription_cancelled'
    | 'subscription_changed'
    | 'invoice_generated'
    | 'payment_recorded'
    | 'product_created';
  title: string;
  description: string;
  entityId?: string;
  entityType?: 'customer' | 'subscription' | 'invoice' | 'payment' | 'product';
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivityDocument>(
  {
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    entityType: {
      type: String,
      enum: ['customer', 'subscription', 'invoice', 'payment', 'product'],
      default: undefined,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ActivitySchema.index({ createdAt: -1 });

export const Activity: Model<IActivityDocument> =
  mongoose.models.Activity || mongoose.model<IActivityDocument>('Activity', ActivitySchema);

export default Activity;

