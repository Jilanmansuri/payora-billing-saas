import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivities } from '@/services/activity.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const activities = await getRecentActivities(limit);
    return NextResponse.json({ success: true, data: activities });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activity';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

