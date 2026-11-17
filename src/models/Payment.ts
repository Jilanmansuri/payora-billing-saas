import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaymentDocument extends Document {
  paymentId: string;
  invoiceId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'bank_transfer' | 'upi' | 'card';
  paymentStatus: 'successful' | 'pending' | 'failed';
  transactionReference: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: [true, 'Invoice ID is required'],
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than zero'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'upi', 'card'],
      required: true,
      default: 'card',
    },
    paymentStatus: {
      type: String,
      enum: ['successful', 'pending', 'failed'],
      default: 'successful',
      index: true,
    },
    transactionReference: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    notes: {
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

PaymentSchema.index({ customerId: 1, paymentDate: -1 });

export const Payment: Model<IPaymentDocument> =
  mongoose.models.Payment || mongoose.model<IPaymentDocument>('Payment', PaymentSchema);

export default Payment;

