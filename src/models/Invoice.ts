import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoiceLineItemDocument {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface IInvoiceDocument extends Document {
  invoiceNumber: string;
  customerId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId | null;
  issueDate: Date;
  dueDate: Date;
  lineItems: IInvoiceLineItemDocument[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceLineItemSchema = new Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoiceDocument>(
  {
    invoiceNumber: {
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
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
      index: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    lineItems: {
      type: [InvoiceLineItemSchema],
      required: true,
      validate: {
        validator: (v: IInvoiceLineItemDocument[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one line item is required',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxableAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    balance: {
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
    status: {
      type: String,
      enum: ['draft', 'pending', 'paid', 'overdue'],
      default: 'pending',
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

InvoiceSchema.index({ customerId: 1, status: 1 });

export const Invoice: Model<IInvoiceDocument> =
  mongoose.models.Invoice || mongoose.model<IInvoiceDocument>('Invoice', InvoiceSchema);

export default Invoice;

