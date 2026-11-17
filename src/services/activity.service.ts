import connectToDatabase from '@/lib/mongodb';
import Activity, { IActivityDocument } from '@/models/Activity';

export interface CreateActivityParams {
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
}

export async function logActivity(params: CreateActivityParams): Promise<IActivityDocument | null> {
  try {
    await connectToDatabase();
    const activity = await Activity.create({
      ...params,
      createdAt: new Date(),
    });
    return activity;
  } catch (err) {
    console.error('Failed to log activity:', err);
    return null;
  }
}

export async function getRecentActivities(limit: number = 10) {
  await connectToDatabase();
  return Activity.find({}).sort({ createdAt: -1 }).limit(limit).lean();
}

