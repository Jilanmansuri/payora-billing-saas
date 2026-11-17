import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsData, AnalyticsFilterParams } from '@/services/analytics.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get('range') || '30d') as AnalyticsFilterParams['range'];
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const data = await getAnalyticsData({
      range,
      startDate,
      endDate,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch analytics data';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

