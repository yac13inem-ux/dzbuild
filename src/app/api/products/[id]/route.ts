import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Failed to get product' }, { status: 500 });
  }
}

// PUT - Update product (no edit_token required)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      title,
      name,
      description,
      category,
      price,
      unit,
      stock,
      imageUrl,
      images,
      is_active,
    } = body;

    const productName = title || name;

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: productName,
        description,
        category_id: category,
        price: parseFloat(price) || 0,
        unit: unit || 'piece',
        stock: stock || 0,
        image_url: imageUrl || (images && images[0]) || null,
        images,
        is_active: is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to update product: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Delete product (no edit_token required)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('[Products API] Deleting product:', id);
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Products API] Delete error:', error);
      return NextResponse.json({ 
        error: 'Failed to delete product: ' + error.message 
      }, { status: 500 });
    }

    console.log('[Products API] Product deleted successfully:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
