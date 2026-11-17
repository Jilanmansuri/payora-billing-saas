import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, updateCustomer, deleteCustomer } from '@/services/customer.service';
import { customerSchema } from '@/lib/validations';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = await getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: customer });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching customer';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = customerSchema.partial().parse(body);
    const updated = await updateCustomer(id, validatedData);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update customer';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteCustomer(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete customer';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

