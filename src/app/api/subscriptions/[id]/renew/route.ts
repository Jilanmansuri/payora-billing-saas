import { NextRequest, NextResponse } from 'next/server';
import { simulateRenewal } from '@/services/subscription.service';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await simulateRenewal(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to simulate renewal';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

