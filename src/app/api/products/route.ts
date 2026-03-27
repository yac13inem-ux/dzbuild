import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Product categories with Arabic and French names
export const PRODUCT_CATEGORIES = [
  { id: 'cement', nameAr: '🪨 إسمنت', nameFr: '🪨 Ciment', shortNameAr: 'إسمنت', shortNameFr: 'Ciment', icon: '🪨', color: 'bg-gray-500', unit: 'شيك' },
  { id: 'steel', nameAr: '🔩 حديد', nameFr: '🔩 Acier', shortNameAr: 'حديد', shortNameFr: 'Acier', icon: '🔩', color: 'bg-slate-600', unit: 'طن' },
  { id: 'bricks', nameAr: '🧱 طوب', nameFr: '🧱 Briques', shortNameAr: 'طوب', shortNameFr: 'Briques', icon: '🧱', color: 'bg-orange-500', unit: 'قطعة' },
  { id: 'sand', nameAr: '🏖️ رمل', nameFr: '🏖️ Sable', shortNameAr: 'رمل', shortNameFr: 'Sable', icon: '🏖️', color: 'bg-yellow-600', unit: 'م³' },
  { id: 'gravel', nameAr: '🪨 حصى', nameFr: '🪨 Gravier', shortNameAr: 'حصى', shortNameFr: 'Gravier', icon: '🪨', color: 'bg-stone-500', unit: 'م³' },
  { id: 'tools', nameAr: '🔧 أدوات بناء', nameFr: '🔧 Outils', shortNameAr: 'أدوات', shortNameFr: 'Outils', icon: '🔧', color: 'bg-red-500', unit: 'قطعة' },
  { id: 'equipment', nameAr: '🚜 معدات', nameFr: '🚜 Équipements', shortNameAr: 'معدات', shortNameFr: 'Équipements', icon: '🚜', color: 'bg-amber-600', unit: 'وحدة' },
];

// Wilayas of Algeria
export const WILAYAS = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
  'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
  'عين الدفلى', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
  'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
  'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
  'سوق أهراس', 'ميلة', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان'
];

// GET - Public API for products (no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const wilaya = searchParams.get('wilaya');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (wilaya) {
      query = query.eq('wilaya', wilaya);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({
        products: [],
        categories: PRODUCT_CATEGORIES,
        wilayas: WILAYAS,
        total: 0
      });
    }

    // Filter by search if provided
    let products = data || [];
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      products,
      categories: PRODUCT_CATEGORIES,
      wilayas: WILAYAS,
      total: products.length
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({
      products: [],
      categories: PRODUCT_CATEGORIES,
      wilayas: WILAYAS,
      total: 0
    });
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      name,
      nameAr,
      nameFr,
      description,
      descriptionAr,
      descriptionFr,
      category,
      categoryId,
      price,
      oldPrice,
      unit,
      stock,
      imageUrl,
      images,
      isFeatured,
      isActive,
      companyId,
      // Supplier fields
      supplier_name,
      supplier_phone,
      supplier_email,
      city,
      wilaya,
    } = body;

    // Support both title and name for backward compatibility
    const productName = title || name;

    if (!productName || !price) {
      return NextResponse.json(
        { error: 'Title/Name and price are required' },
        { status: 400 }
      );
    }

    // Generate a unique ID
    const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        id,
        name: productName,
        name_ar: nameAr,
        name_fr: nameFr,
        description,
        description_ar: descriptionAr,
        description_fr: descriptionFr,
        category: category || categoryId,
        category_id: categoryId || category,
        price: parseFloat(price) || 0,
        old_price: oldPrice ? parseFloat(oldPrice) : null,
        unit: unit || 'piece',
        stock: stock || 0,
        image_url: imageUrl,
        images: images,
        is_featured: isFeatured || false,
        is_active: isActive !== false,
        company_id: companyId,
        // Supplier info
        supplier_name,
        supplier_phone,
        supplier_email,
        city,
        wilaya,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Create product error:', error);
      return NextResponse.json({ 
        error: 'Failed to create product: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
