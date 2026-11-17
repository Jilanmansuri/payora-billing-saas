import { NextRequest, NextResponse } from 'next/server';
import { cancelSubscription } from '@/services/subscription.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const sub = await cancelSubscription(id, body.notes);
    return NextResponse.json({ success: true, data: sub });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

