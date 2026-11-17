import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionById } from '@/services/subscription.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subscription = await getSubscriptionById(id);
    if (!subscription) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: subscription });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching subscription';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

