import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch all products for admin
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ products: [] });
    }
    
    return NextResponse.json({ products: data || [] });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Creating product with data:', data);
    
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: data.name || '',
        name_ar: data.nameAr || null,
        name_fr: data.nameFr || null,
        description: data.description || null,
        description_ar: data.descriptionAr || null,
        description_fr: data.descriptionFr || null,
        category_id: data.categoryId || null,
        price: data.price || 0,
        old_price: data.oldPrice || null,
        unit: data.unit || 'piece',
        stock: data.stock || 0,
        image_url: data.imageUrl || null,
        images: data.images || null,
        is_featured: data.isFeatured || false,
        is_active: data.isActive !== false,
        company_id: data.companyId || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ 
        error: 'Failed to create product: ' + error.message 
      }, { status: 500 });
    }
    
    console.log('Created product:', product);
    
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ 
      error: 'Failed to create product: ' + (error as Error).message 
    }, { status: 500 });
  }
}
