import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById } from '@/services/invoice.service';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await getInvoiceById(id);
    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: invoice });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching invoice data for PDF';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

