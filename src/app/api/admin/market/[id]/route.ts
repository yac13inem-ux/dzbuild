import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch single product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    console.log('Updating product:', id, 'with data:', data);
    
    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: data.name,
        name_ar: data.nameAr || data.name_ar || null,
        name_fr: data.nameFr || data.name_fr || null,
        description: data.description || null,
        description_ar: data.descriptionAr || data.description_ar || null,
        description_fr: data.descriptionFr || data.description_fr || null,
        category_id: data.categoryId || data.category_id || null,
        price: data.price || 0,
        old_price: data.oldPrice || data.old_price || null,
        unit: data.unit || 'piece',
        stock: data.stock || 0,
        is_featured: data.isFeatured || data.is_featured || false,
        is_active: data.isActive !== false && data.is_active !== false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json({ 
        error: 'Failed to update product: ' + error.message 
      }, { status: 500 });
    }
    
    console.log('Updated product:', product);
    
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ 
      error: 'Failed to update product: ' + (error as Error).message 
    }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('DELETE request for product:', id);
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({ 
        error: 'Failed to delete product: ' + error.message 
      }, { status: 500 });
    }
    
    console.log('Deleted product:', id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product: ' + (error as Error).message 
    }, { status: 500 });
  }
}
