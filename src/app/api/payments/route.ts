import { NextRequest, NextResponse } from 'next/server';
import { getPayments, recordPayment } from '@/services/payment.service';
import { paymentSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const invoiceId = searchParams.get('invoiceId') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await getPayments({
      page,
      limit,
      invoiceId,
      customerId,
      paymentMethod,
      paymentStatus,
      startDate,
      endDate,
      search,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch payments';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = paymentSchema.parse(body);
    const payment = await recordPayment(validated);
    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record payment';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

