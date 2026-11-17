import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/services/dashboard.service';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

