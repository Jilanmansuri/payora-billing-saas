import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';
import Customer from '@/models/Customer';
import connectToDatabase from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const dropExisting = Boolean(body.dropExisting);
    const result = await seedDatabase(dropExisting);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    console.error('Seed API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to seed database';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const customerCount = await Customer.countDocuments();
    return NextResponse.json({
      success: true,
      hasData: customerCount > 0,
      customerCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database check failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

