import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptions, createSubscription } from '@/services/subscription.service';
import { subscriptionSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const billingInterval = searchParams.get('billingInterval') || '';
    const customerId = searchParams.get('customerId') || undefined;

    const result = await getSubscriptions({
      page,
      limit,
      search,
      status,
      billingInterval,
      customerId,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscriptions';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = subscriptionSchema.parse(body);
    const result = await createSubscription(validated);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create subscription';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

