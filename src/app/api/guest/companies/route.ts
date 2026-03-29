import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch companies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const type = searchParams.get('type');
    const wilaya = searchParams.get('wilaya');

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
      console.error('Fetch companies error:', error);
      return NextResponse.json({ companies: [] });
    }

    const formatted = (companies || []).map(c => ({
      id: c.id,
      name: c.name,
      name_fr: c.name_fr,
      description: c.description,
      company_type: c.type,
      type: c.type,
      phone: c.phone,
      email: c.email,
      website: c.website,
      city: c.city,
      wilaya: c.wilaya,
      address: c.address,
      logo: c.logo,
      specialties: c.specialties || [],
      founded_year: c.founded_year,
      is_verified: c.is_verified || false,
      is_featured: c.is_featured || false,
      rating: c.rating || 0,
      review_count: c.review_count || 0,
      created_at: c.created_at,
      edit_token: c.edit_token,
    }));

    return NextResponse.json({ companies: formatted });
  } catch (error) {
    console.error('Fetch companies error:', error);
    return NextResponse.json({ companies: [] });
  }
}

// POST - Create company (guest allowed, no edit code needed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = `comp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const insertData: Record<string, unknown> = {
      id,
      name: body.name?.trim() || 'شركة',
      name_fr: body.name_fr?.trim() || null,
      description: body.description?.trim() || null,
      type: body.company_type || body.type || 'BET',
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      website: body.website?.trim() || null,
      city: body.city?.trim() || null,
      wilaya: body.wilaya || null,
      address: body.address?.trim() || null,
      specialties: body.specialties || [],
      founded_year: body.founded_year ? parseInt(body.founded_year) : null,
      is_active: true,
      is_verified: false,
      is_featured: false,
      rating: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('companies')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Create company error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      company: data,
    });
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// PUT - Update company (no edit code required)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.company_type || updateData.type) updateFields.type = updateData.company_type || updateData.type;
    if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
    if (updateData.email !== undefined) updateFields.email = updateData.email;
    if (updateData.website !== undefined) updateFields.website = updateData.website;
    if (updateData.city !== undefined) updateFields.city = updateData.city;
    if (updateData.wilaya !== undefined) updateFields.wilaya = updateData.wilaya;

    const { data, error } = await supabase
      .from('companies')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update company error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, company: data });
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// DELETE - Delete company (no edit code required)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });
    }

    const { error } = await supabase.from('companies').delete().eq('id', id);

    if (error) {
      console.error('Delete company error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete company error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
