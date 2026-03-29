import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { randomBytes } from 'crypto';

function generateEditToken(): string {
  return randomBytes(32).toString('hex');
}

// GET - Fetch projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Fetch projects error:', error);
      return NextResponse.json({ projects: [] });
    }

    const formatted = (projects || []).map(p => ({
      id: p.id,
      title: p.title,
      title_ar: p.title_ar,
      title_fr: p.title_fr,
      description: p.description,
      description_ar: p.description_ar,
      description_fr: p.description_fr,
      category: p.category,
      status: p.status || 'planning',
      progress: p.progress || 0,
      location: p.location,
      city: p.city,
      wilaya: p.wilaya,
      budget: p.budget,
      start_date: p.start_date,
      end_date: p.end_date,
      images: p.images,
      created_at: p.created_at,
      edit_token: p.edit_token,
    }));

    return NextResponse.json({ projects: formatted });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return NextResponse.json({ projects: [] });
  }
}

// POST - Create project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const editToken = generateEditToken();
    const id = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const insertData: Record<string, unknown> = {
      id,
      title: body.title?.trim() || 'مشروع',
      title_ar: body.title_ar?.trim() || null,
      title_fr: body.title_fr?.trim() || null,
      description: body.description?.trim() || null,
      description_ar: body.description_ar?.trim() || null,
      description_fr: body.description_fr?.trim() || null,
      category: body.category || 'residential',
      status: body.status || 'planning',
      progress: parseInt(body.progress) || 0,
      location: body.location || body.city || null,
      city: body.city?.trim() || body.location || null,
      wilaya: body.wilaya || null,
      budget: parseFloat(body.budget) || null,
      start_date: body.start_date ? new Date(body.start_date).toISOString() : null,
      end_date: body.end_date ? new Date(body.end_date).toISOString() : null,
      images: body.images || [],
      edit_token: editToken,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    // Try inserting with edit_token first
    let { data, error } = await supabase
      .from('projects')
      .insert(insertData)
      .select()
      .single();

    // If edit_token column doesn't exist, retry without it
    if (error?.message?.includes('edit_token') || error?.message?.includes('column')) {
      console.log('Retrying without edit_token column...');
      const insertDataWithoutToken = { ...insertData };
      delete insertDataWithoutToken.edit_token;
      
      const result = await supabase
        .from('projects')
        .insert(insertDataWithoutToken)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Create project error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      project: { ...data, editToken },
      editToken,
    });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// PUT - Update project (no edit code required)
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

    if (updateData.title) updateFields.title = updateData.title;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.category) updateFields.category = updateData.category;
    if (updateData.status) updateFields.status = updateData.status;
    if (updateData.progress !== undefined) updateFields.progress = parseInt(updateData.progress) || 0;
    if (updateData.location !== undefined) updateFields.location = updateData.location;
    if (updateData.city !== undefined) updateFields.city = updateData.city;
    if (updateData.wilaya !== undefined) updateFields.wilaya = updateData.wilaya;
    if (updateData.budget !== undefined) updateFields.budget = parseFloat(updateData.budget) || null;
    if (updateData.images) updateFields.images = updateData.images;

    const { data, error } = await supabase
      .from('projects')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update project error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, project: data });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// DELETE - Delete project (no edit code required)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });
    }

    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      console.error('Delete project error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
