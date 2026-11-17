import { NextRequest, NextResponse } from 'next/server';
import { getUpcomingRenewals } from '@/services/dashboard.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const renewals = await getUpcomingRenewals(limit);
    return NextResponse.json({ success: true, data: renewals });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch renewals';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

