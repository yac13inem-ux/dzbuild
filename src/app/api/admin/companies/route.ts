import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Company types
export const COMPANY_TYPES = {
  BET: { id: 'BET', nameAr: 'مكتب دراسات', nameFr: "Bureau d'Études Techniques", icon: '🏢' },
  CONSTRUCTION: { id: 'CONSTRUCTION', nameAr: 'شركة مقاولات', nameFr: 'Entreprise de Construction', icon: '🏗️' },
  MATERIALS: { id: 'MATERIALS', nameAr: 'شركة مواد البناء', nameFr: 'Fournisseur de Matériaux', icon: '🧱' },
  SURVEY: { id: 'SURVEY', nameAr: 'مكتب مسح طوبوغرافي', nameFr: 'Cabinet de Topographie', icon: '📐' },
  ELECTRICAL_MECHANICAL: { id: 'ELECTRICAL_MECHANICAL', nameAr: 'شركة كهرباء وميكانيك', nameFr: 'Entreprise Électromécanique', icon: '⚡' },
} as const;

// GET - Fetch all companies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const wilaya = searchParams.get('wilaya');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const isVerified = searchParams.get('verified');
    const isFeatured = searchParams.get('featured');

    let query = supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (type) {
      query = query.eq('type', type);
    }

    if (wilaya) {
      query = query.eq('wilaya', wilaya);
    }

    if (city) {
      query = query.eq('city', city);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (isVerified === 'true') {
      query = query.eq('is_verified', true);
    }

    if (isFeatured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json({ companies: [] });
    }

    // Transform data for frontend compatibility
    const companies = (data || []).map(company => ({
      ...company,
      company_type: company.type, // Add company_type field for frontend
      logo_url: company.logo,
      cover_image_url: company.cover_image,
    }));

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Companies API error:', error);
    return NextResponse.json({ companies: [] });
  }
}

// POST - Create new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Accept both 'type' and 'company_type'
    const companyType = body.type || body.company_type;

    if (!body.name || !companyType) {
      return NextResponse.json(
        { error: 'Name and company type are required' },
        { status: 400 }
      );
    }

    // Only insert columns that exist in the database
    const insertData: Record<string, unknown> = {
      name: body.name,
      name_fr: body.name_fr || null,
      description: body.description || null,
      description_fr: body.description_fr || null,
      type: companyType,
      email: body.email || null,
      phone: body.phone || null,
      website: body.website || null,
      address: body.address || null,
      city: body.city || null,
      wilaya: body.wilaya || null,
      founded_year: body.founded_year ? parseInt(body.founded_year) : null,
      specialties: body.specialties || [],
      services: body.services || [],
      is_active: true,
      is_verified: false,
      is_featured: false,
      rating: 0,
      review_count: 0,
    };

    // Add optional fields if provided
    if (body.logo_url) insertData.logo = body.logo_url;
    if (body.cover_image_url) insertData.cover_image = body.cover_image_url;

    const { data, error } = await supabase
      .from('companies')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Create company error:', error);
      return NextResponse.json({ 
        error: 'Failed to create company: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, company: data });
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}

// PUT - Update company
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    // Map frontend fields to database columns
    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that exist in the database
    const allowedFields = [
      'name', 'name_fr', 'description', 'description_fr', 'type',
      'email', 'phone', 'website', 'address', 'city', 'wilaya',
      'founded_year', 'specialties', 'services',
      'is_active', 'is_verified', 'is_featured', 'rating', 'review_count'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        dbUpdates[field] = updates[field];
      }
    }

    // Map frontend field names to database column names
    if (updates.company_type) dbUpdates.type = updates.company_type;
    if (updates.logo_url) dbUpdates.logo = updates.logo_url;
    if (updates.cover_image_url) dbUpdates.cover_image = updates.cover_image_url;

    const { data, error } = await supabase
      .from('companies')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update company error:', error);
      return NextResponse.json({ error: 'Failed to update company: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, company: data });
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

// DELETE - Delete company
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete company error:', error);
      return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete company error:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
