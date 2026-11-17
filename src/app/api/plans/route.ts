import { NextRequest, NextResponse } from 'next/server';
import { getPlans, createPricingPlan } from '@/services/product.service';
import { pricingPlanSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId') || undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined;

    const plans = await getPlans({ productId, isActive });
    return NextResponse.json({ success: true, data: plans });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch plans';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = pricingPlanSchema.parse(body);
    const plan = await createPricingPlan(validated);
    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create plan';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

