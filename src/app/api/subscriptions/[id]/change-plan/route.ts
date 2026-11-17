import { NextRequest, NextResponse } from 'next/server';
import { changeSubscriptionPlan } from '@/services/subscription.service';
import { changePlanSchema } from '@/lib/validations';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = changePlanSchema.parse(body);
    const sub = await changeSubscriptionPlan(id, validated.newPlanId, validated.notes);
    return NextResponse.json({ success: true, data: sub });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to change subscription plan';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

