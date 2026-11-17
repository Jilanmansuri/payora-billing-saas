import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, archiveProduct } from '@/services/product.service';
import { productSchema } from '@/lib/validations';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching product';
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
    const validated = productSchema.partial().parse(body);
    const updated = await updateProduct(id, validated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const archived = await archiveProduct(id);
    return NextResponse.json({ success: true, message: 'Product archived', data: archived });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to archive product';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

