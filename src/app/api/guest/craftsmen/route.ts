import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch craftsmen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const category = searchParams.get('category');
    const wilaya = searchParams.get('wilaya');

    let query = supabase
      .from('craftsmen')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (wilaya) {
      query = query.eq('wilaya', wilaya);
    }

    const { data: craftsmen, error } = await query;

    if (error) {
      console.error('Fetch craftsmen error:', error);
      return NextResponse.json({ craftsmen: [] });
    }

    const formatted = (craftsmen || []).map(c => ({
      id: c.id,
      name: c.name,
      category: c.category,
      description: c.description,
      experience_years: c.experience || 0,
      phone: c.phone,
      email: c.email,
      city: c.city,
      wilaya: c.wilaya,
      image: c.image_url,
      is_verified: c.verified || false,
      is_available: c.is_available !== false,
      rating: c.rating || 0,
      review_count: c.review_count || 0,
      created_at: c.created_at,
    }));

    return NextResponse.json({ craftsmen: formatted });
  } catch (error) {
    console.error('Fetch craftsmen error:', error);
    return NextResponse.json({ craftsmen: [] });
  }
}

// POST - Create craftsman (guest allowed, no edit code needed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = `craft-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const insertData: Record<string, unknown> = {
      id,
      name: body.name?.trim() || 'حرفي',
      category: body.category || 'builder',
      description: body.description || body.bio?.trim() || null,
      experience: parseInt(body.experience_years || body.experience) || 0,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      city: body.city?.trim() || null,
      wilaya: body.wilaya || null,
      image_url: body.image || null,
      is_active: true,
      is_available: true,
      verified: false,
      rating: 0,
      review_count: 0,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('craftsmen')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Create craftsman error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return in frontend format
    const craftsman = {
      id: data.id,
      name: data.name,
      category: data.category,
      description: data.description,
      experience_years: data.experience || 0,
      phone: data.phone,
      email: data.email,
      city: data.city,
      wilaya: data.wilaya,
      image: data.image_url,
      is_verified: data.verified || false,
      is_available: data.is_available !== false,
      rating: data.rating || 0,
      review_count: data.review_count || 0,
      created_at: data.created_at,
    };

    return NextResponse.json({
      success: true,
      craftsman,
    });
  } catch (error) {
    console.error('Create craftsman error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// PUT - Update craftsman (no edit code required)
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
    if (updateData.category) updateFields.category = updateData.category;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.experience_years !== undefined) updateFields.experience = parseInt(updateData.experience_years) || 0;
    if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
    if (updateData.email !== undefined) updateFields.email = updateData.email;
    if (updateData.city !== undefined) updateFields.city = updateData.city;
    if (updateData.wilaya !== undefined) updateFields.wilaya = updateData.wilaya;
    if (updateData.image) {
      updateFields.image_url = updateData.image;
    }

    const { data, error } = await supabase
      .from('craftsmen')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update craftsman error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return in frontend format
    const craftsman = {
      id: data.id,
      name: data.name,
      category: data.category,
      description: data.description,
      experience_years: data.experience || 0,
      phone: data.phone,
      email: data.email,
      city: data.city,
      wilaya: data.wilaya,
      image: data.image_url,
      is_verified: data.verified || false,
      is_available: data.is_available !== false,
      rating: data.rating || 0,
      review_count: data.review_count || 0,
    };

    return NextResponse.json({ success: true, craftsman });
  } catch (error) {
    console.error('Update craftsman error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// DELETE - Delete craftsman (no edit code required)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });
    }

    const { error } = await supabase.from('craftsmen').delete().eq('id', id);

    if (error) {
      console.error('Delete craftsman error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete craftsman error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
