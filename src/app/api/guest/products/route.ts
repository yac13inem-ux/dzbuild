import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const category = searchParams.get('category');

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Fetch products error:', error);
      return NextResponse.json({ products: [] });
    }

    const formattedProducts = (products || []).map(p => ({
      id: p.id,
      title: p.name || p.title,
      name: p.name || p.title,
      description: p.description,
      category: p.category_id,
      category_id: p.category_id,
      price: p.price,
      unit: p.unit,
      stock: p.stock,
      image: p.image_url,
      image_url: p.image_url,
      images: p.images,
      is_featured: p.is_featured,
      created_at: p.created_at,
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ products: [] });
  }
}

// POST - Create product (guest allowed, no edit code needed)
export async function POST(request: NextRequest) {
  try {
    console.log('[Products API] POST request received');
    const body = await request.json();
    console.log('[Products API] Request body:', JSON.stringify(body, null, 2));
    
    const {
      title,
      name,
      description,
      category,
      price,
      unit,
      stock,
      images,
      image,
    } = body;

    const productName = title || name;
    
    if (!productName) {
      console.log('[Products API] Error: Product name is required');
      return NextResponse.json({ error: 'اسم المنتج مطلوب' }, { status: 400 });
    }

    const productId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Only include fields that exist in the database schema
    const insertData: Record<string, unknown> = {
      id: productId,
      name: productName.trim(),
      description: description?.trim() || null,
      category_id: category || 'materials',
      price: parseFloat(price) || 0,
      unit: unit || 'وحدة',
      stock: parseInt(stock) || 0,
      image_url: image || (images && images[0]) || null,
      images: images || [],
      is_active: true,
      is_featured: false,
      created_at: new Date().toISOString(),
    };

    console.log('[Products API] Inserting product:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[Products API] Create product error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[Products API] Product created successfully:', data.id);

    return NextResponse.json({
      success: true,
      product: {
        id: data.id,
        title: data.name,
        name: data.name,
        description: data.description,
        category: data.category_id,
        price: data.price,
        unit: data.unit,
        stock: data.stock,
        image: data.image_url,
        images: data.images,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    console.error('[Products API] Create product error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// PUT - Update product (no edit code required)
export async function PUT(request: NextRequest) {
  try {
    console.log('[Products API] PUT request received');
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.title || updateData.name) {
      updateFields.name = updateData.title || updateData.name;
    }
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.category) updateFields.category_id = updateData.category;
    if (updateData.price !== undefined) updateFields.price = parseFloat(updateData.price) || 0;
    if (updateData.unit) updateFields.unit = updateData.unit;
    if (updateData.stock !== undefined) updateFields.stock = parseInt(updateData.stock) || 0;
    if (updateData.image || updateData.images) {
      updateFields.image_url = updateData.image || (updateData.images && updateData.images[0]);
      updateFields.images = updateData.images || [updateData.image];
    }

    console.log('[Products API] Updating product:', id, JSON.stringify(updateFields, null, 2));

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Products API] Update product error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct.id,
        title: updatedProduct.name,
        name: updatedProduct.name,
        description: updatedProduct.description,
        category: updatedProduct.category_id,
        price: updatedProduct.price,
        unit: updatedProduct.unit,
        stock: updatedProduct.stock,
        image: updatedProduct.image_url,
        images: updatedProduct.images,
        created_at: updatedProduct.created_at,
      }
    });
  } catch (error) {
    console.error('[Products API] Update product error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// DELETE - Delete product (no edit code required)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });
    }

    console.log('[Products API] Deleting product:', id);

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('[Products API] Delete product error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    console.error('[Products API] Delete product error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
