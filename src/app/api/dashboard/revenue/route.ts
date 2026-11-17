import { NextRequest, NextResponse } from 'next/server';
import { getDashboardMonthlyRevenue, getDashboardSubscriptionOverview } from '@/services/dashboard.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get('months') || '6', 10);

    const [monthlyRevenue, subscriptionOverview] = await Promise.all([
      getDashboardMonthlyRevenue(months),
      getDashboardSubscriptionOverview(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        monthlyRevenue,
        subscriptionOverview,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch revenue data';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

