import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, createCustomer } from '@/services/customer.service';
import { customerSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const isArchived = searchParams.get('archived') === 'true' ? true : false;

    const result = await getCustomers({
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      isArchived,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve customers';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = customerSchema.parse(body);
    const customer = await createCustomer(validatedData);
    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Failed to create customer';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

