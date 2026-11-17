import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import PricingPlan from '@/models/PricingPlan';
import Subscription from '@/models/Subscription';
import { logActivity } from './activity.service';
import mongoose from 'mongoose';

export async function getProducts(params: { search?: string; status?: string } = {}) {
  await connectToDatabase();
  const query: Record<string, unknown> = {};

  if (params.status && params.status !== 'all') {
    query.status = params.status;
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
    ];
  }

  const products = await Product.find(query).sort({ createdAt: -1 }).lean();
  const productIds = products.map((p) => p._id);

  const plans = await PricingPlan.find({ productId: { $in: productIds } }).lean();

  const plansMap = new Map<string, typeof plans>();
  plans.forEach((plan) => {
    const key = plan.productId.toString();
    const existing = plansMap.get(key) || [];
    existing.push(plan);
    plansMap.set(key, existing);
  });

  return products.map((p) => ({
    ...p,
    plans: plansMap.get(p._id.toString()) || [],
  }));
}

export async function getProductById(id: string) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  const product = await Product.findById(id).lean();
  if (!product) return null;

  const plans = await PricingPlan.find({ productId: id }).sort({ amount: 1 }).lean();

  return {
    ...product,
    plans,
  };
}

export async function createProduct(data: {
  name: string;
  description?: string;
  category: string;
  status?: 'active' | 'archived';
}) {
  await connectToDatabase();

  const product = await Product.create(data);

  await logActivity({
    type: 'product_created',
    title: 'Product Created',
    description: `Product "${product.name}" created under ${product.category}`,
    entityId: product._id.toString(),
    entityType: 'product',
  });

  return product;
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid product ID');

  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return product;
}

export async function archiveProduct(id: string) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid product ID');

  const product = await Product.findByIdAndUpdate(
    id,
    { status: 'archived' },
    { new: true }
  );
  return product;
}

// Pricing Plan operations
export async function getPlans(params: { productId?: string; isActive?: boolean } = {}) {
  await connectToDatabase();
  const query: Record<string, unknown> = {};

  if (params.productId && mongoose.Types.ObjectId.isValid(params.productId)) {
    query.productId = params.productId;
  }
  if (typeof params.isActive === 'boolean') {
    query.isActive = params.isActive;
  }

  return PricingPlan.find(query).populate('productId').sort({ amount: 1 }).lean();
}

export async function createPricingPlan(data: {
  name: string;
  productId: string;
  amount: number;
  currency?: string;
  billingInterval: 'monthly' | 'yearly' | 'one-time';
  billingIntervalCount?: number;
  isActive?: boolean;
  description?: string;
}) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(data.productId)) {
    throw new Error('Invalid product ID');
  }

  const plan = await PricingPlan.create(data);
  return plan;
}

export async function updatePricingPlan(id: string, data: Record<string, unknown>) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid pricing plan ID');

  const plan = await PricingPlan.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return plan;
}

export async function deletePricingPlan(id: string) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error('Invalid pricing plan ID');

  // Check if active subscriptions depend on this plan
  const activeSubsCount = await Subscription.countDocuments({
    pricingPlanId: id,
    status: { $in: ['active', 'paused'] },
  });

  if (activeSubsCount > 0) {
    // Soft disable instead of breaking subscriptions
    await PricingPlan.findByIdAndUpdate(id, { isActive: false });
    return {
      deactivated: true,
      message: 'Plan is in use by active subscriptions. It was deactivated instead of deleted.',
    };
  }

  await PricingPlan.findByIdAndDelete(id);
  return { deleted: true, message: 'Plan removed successfully.' };
}

