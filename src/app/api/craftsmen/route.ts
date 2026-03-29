import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Craftsman categories with Arabic and French names (matching AddItemDialog)
export const CRAFTSMAN_CATEGORIES = [
  { id: 'builder', nameAr: 'بناء', nameFr: 'Maçonnerie', icon: '🧱', color: 'bg-amber-500' },
  { id: 'plumber', nameAr: 'سباكة', nameFr: 'Plomberie', icon: '🔧', color: 'bg-blue-500' },
  { id: 'electrician', nameAr: 'كهربائي', nameFr: 'Électricité', icon: '⚡', color: 'bg-yellow-500' },
  { id: 'painter', nameAr: 'دهان', nameFr: 'Peinture', icon: '🎨', color: 'bg-purple-500' },
  { id: 'carpenter', nameAr: 'نجارة', nameFr: 'Menuiserie', icon: '🪚', color: 'bg-green-600' },
  { id: 'tiler', nameAr: 'بلاط', nameFr: 'Carrelage', icon: '🧱', color: 'bg-cyan-500' },
  { id: 'welder', nameAr: 'لحام', nameFr: 'Soudure', icon: '🔥', color: 'bg-orange-600' },
  { id: 'other', nameAr: 'أخرى', nameFr: 'Autre', icon: '🔧', color: 'bg-gray-500' },
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

// GET - Public API for craftsmen (no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const wilaya = searchParams.get('wilaya');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('craftsmen')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (wilaya) {
      query = query.eq('wilaya', wilaya);
    }

    const { data: craftsmen, error } = await query;

    if (error) {
      console.error('Error fetching craftsmen:', error);
      return NextResponse.json({
        craftsmen: [],
        categories: CRAFTSMAN_CATEGORIES,
        wilayas: WILAYAS,
        total: 0
      });
    }

    // Filter by city and search in memory (Supabase doesn't support case-insensitive easily)
    let filtered = craftsmen || [];

    if (city) {
      const cityLower = city.toLowerCase();
      filtered = filtered.filter(c => 
        c.city?.toLowerCase().includes(cityLower)
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower)
      );
    }

    // Transform to frontend format (matching interface in craftsmen-section.tsx)
    const transformed = filtered.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      description: c.description,
      city: c.city,
      wilaya: c.wilaya,
      phone: c.phone,
      email: c.email,
      experience_years: c.experience || 0,
      image: c.image_url,
      is_verified: c.verified || false,
      is_available: c.is_available !== false,
      rating: c.rating || 0,
      review_count: c.review_count || 0,
      created_at: c.created_at,
    }));

    return NextResponse.json({
      craftsmen: transformed,
      categories: CRAFTSMAN_CATEGORIES,
      wilayas: WILAYAS,
      total: transformed.length
    });
  } catch (error) {
    console.error('Craftsmen API error:', error);
    return NextResponse.json({
      craftsmen: [],
      categories: CRAFTSMAN_CATEGORIES,
      wilayas: WILAYAS,
      total: 0
    });
  }
}

// POST - Register a new craftsman
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      specialty,
      specializations,
      city,
      wilaya,
      phone,
      email,
      experience_years,
      experience,
      bio,
      description,
      images,
      hourly_rate,
      daily_rate,
      is_available,
    } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    // Generate a unique ID
    const id = `craft-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const { data: craftsman, error } = await supabase
      .from('craftsmen')
      .insert({
        id,
        name,
        category,
        specialty: specialty || specializations?.[0],
        specializations: specializations || (specialty ? [specialty] : []),
        city,
        wilaya,
        phone,
        email,
        experience: experience_years || experience || 0,
        description: bio || description,
        images,
        hourly_rate,
        daily_rate,
        is_available: is_available !== false,
        is_active: true,
        verified: false,
        rating: 0,
        review_count: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Create craftsman error:', error);
      return NextResponse.json({ 
        error: 'Failed to register craftsman: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, craftsman });
  } catch (error) {
    console.error('Create craftsman error:', error);
    return NextResponse.json({ error: 'Failed to register craftsman' }, { status: 500 });
  }
}
