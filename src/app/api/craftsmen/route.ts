import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Craftsman categories with Arabic and French names
export const CRAFTSMAN_CATEGORIES = [
  { id: 'electrician', nameAr: 'كهربائي', nameFr: 'Électricien', icon: '⚡', color: 'bg-yellow-500' },
  { id: 'plumber', nameAr: 'سباك', nameFr: 'Plombier', icon: '🔧', color: 'bg-blue-500' },
  { id: 'carpenter', nameAr: 'نجار', nameFr: 'Menuisier', icon: '🪚', color: 'bg-amber-600' },
  { id: 'blacksmith', nameAr: 'حداد', nameFr: 'Forgeron', icon: '🔨', color: 'bg-gray-600' },
  { id: 'tiler', nameAr: 'بلاط', nameFr: 'Carreleur', icon: '🧱', color: 'bg-orange-500' },
  { id: 'painter', nameAr: 'دهان', nameFr: 'Peintre', icon: '🎨', color: 'bg-purple-500' },
  { id: 'insulator', nameAr: 'عازل أسطح', nameFr: 'Isolateur', icon: '🏠', color: 'bg-teal-500' },
  { id: 'aluminum', nameAr: 'نجار ألمنيوم', nameFr: 'Aluminier', icon: '🪟', color: 'bg-cyan-500' },
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

    // Transform to frontend format
    const transformed = filtered.map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      city: c.city,
      wilaya: c.wilaya,
      experience: c.experience,
      specializations: c.specializations || [],
      hourlyRate: c.hourly_rate,
      dailyRate: c.daily_rate,
      isAvailable: c.is_available,
      verified: c.verified,
      description: c.description,
      imageUrl: c.image_url,
      rating: c.rating || 0,
      reviewCount: c.review_count || 0,
      phone: c.phone,
      email: c.email,
      createdAt: c.created_at,
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
