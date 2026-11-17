import { NextRequest, NextResponse } from 'next/server';
import { updatePricingPlan, deletePricingPlan } from '@/services/product.service';
import { pricingPlanSchema } from '@/lib/validations';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = pricingPlanSchema.partial().parse(body);
    const updated = await updatePricingPlan(id, validated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update plan';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deletePricingPlan(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete plan';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

