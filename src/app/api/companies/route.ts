import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Company types with Arabic and French names
export const COMPANY_TYPES = [
  { id: 'BET', nameAr: 'مكتب دراسات (BET)', nameFr: "Bureau d'Études Techniques", icon: '🏢', description: 'مكاتب هندسية متخصصة في التصميم والدراسات التقنية' },
  { id: 'CONSTRUCTION', nameAr: 'شركات مقاولات', nameFr: 'Entreprise de Construction', icon: '🏗️', description: 'شركات متخصصة في أشمال البناء والتشييد' },
  { id: 'MATERIALS', nameAr: 'شركات مواد البناء', nameFr: 'Fournisseur de Matériaux', icon: '🧱', description: 'موردين ومصنعي مواد البناء' },
  { id: 'SURVEY', nameAr: 'مكاتب مسح طوبوغرافي', nameFr: 'Cabinet de Topographie', icon: '📐', description: 'مكاتب متخصصة في المسح والخرائط' },
  { id: 'ELECTRICAL_MECHANICAL', nameAr: 'شركات كهرباء وميكانيك', nameFr: 'Entreprise Électromécanique', icon: '⚡', description: 'شركات متخصصة في التركيبات الكهربائية والميكانيكية' },
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

// GET - Public API for companies (no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const wilaya = searchParams.get('wilaya');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (wilaya) {
      query = query.eq('wilaya', wilaya);
    }

    const { data: companies, error } = await query;

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({
        companies: [],
        types: COMPANY_TYPES,
        wilayas: WILAYAS,
        total: 0
      });
    }

    // Filter by city and search in memory
    let filtered = companies || [];

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
        c.name_fr?.toLowerCase().includes(searchLower)
      );
    }

    // Transform to frontend format
    const transformed = filtered.map(c => ({
      id: c.id,
      name: c.name,
      nameFr: c.name_fr,
      type: c.type,
      logo: c.logo,
      coverImage: c.cover_image,
      email: c.email,
      phone: c.phone,
      website: c.website,
      address: c.address,
      city: c.city,
      wilaya: c.wilaya,
      foundedYear: c.founded_year,
      specialties: c.specialties || [],
      services: c.services || [],
      isVerified: c.is_verified,
      isFeatured: c.is_featured,
      rating: c.rating || 0,
      reviewCount: c.review_count || 0,
      description: c.description,
      descriptionFr: c.description_fr,
      createdAt: c.created_at,
    }));

    return NextResponse.json({
      companies: transformed,
      types: COMPANY_TYPES,
      wilayas: WILAYAS,
      total: transformed.length
    });
  } catch (error) {
    console.error('Companies API error:', error);
    return NextResponse.json({
      companies: [],
      types: COMPANY_TYPES,
      wilayas: WILAYAS,
      total: 0
    });
  }
}
