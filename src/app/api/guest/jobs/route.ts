import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { randomBytes } from 'crypto';

function generateEditToken(): string {
  return randomBytes(32).toString('hex');
}

// GET - Fetch jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const category = searchParams.get('category');
    const wilaya = searchParams.get('wilaya');

    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (wilaya) {
      query = query.eq('wilaya', wilaya);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Fetch jobs error:', error);
      return NextResponse.json({ jobs: [] });
    }

    const formatted = (jobs || []).map(j => ({
      id: j.id,
      title: j.title,
      description: j.description,
      category: j.category,
      company_name: j.company_name,
      company_logo: j.company_logo,
      city: j.city,
      wilaya: j.wilaya,
      experience_level: j.experience_level,
      salary_range: j.salary_range,
      job_type: j.job_type,
      contact_email: j.contact_email,
      contact_phone: j.contact_phone,
      deadline: j.deadline,
      is_featured: j.is_featured || false,
      views_count: j.views_count || 0,
      status: j.status,
      created_at: j.created_at,
      edit_token: j.edit_token,
    }));

    return NextResponse.json({ jobs: formatted });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ jobs: [] });
  }
}

// POST - Create job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const editToken = generateEditToken();
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const insertData: Record<string, unknown> = {
      id,
      title: body.title?.trim() || 'وظيفة',
      description: body.description?.trim() || null,
      category: body.category || 'engineering',
      company_name: body.company_name?.trim() || 'شركة',
      company_logo: body.company_logo || null,
      city: body.city?.trim() || null,
      wilaya: body.wilaya || null,
      experience_level: body.experience_level || 'any',
      salary_range: body.salary_range?.trim() || null,
      job_type: body.job_type || 'full_time',
      contact_email: body.contact_email?.trim() || null,
      contact_phone: body.contact_phone?.trim() || null,
      deadline: body.deadline ? new Date(body.deadline).toISOString() : null,
      edit_token: editToken,
      is_featured: false,
      status: 'active',
      views_count: 0,
      created_at: new Date().toISOString(),
    };

    // Try inserting with edit_token first
    let { data, error } = await supabase
      .from('jobs')
      .insert(insertData)
      .select()
      .single();

    // If edit_token column doesn't exist, retry without it
    if (error?.message?.includes('edit_token') || error?.message?.includes('column')) {
      console.log('Retrying without edit_token column...');
      const insertDataWithoutToken = { ...insertData };
      delete insertDataWithoutToken.edit_token;
      
      const result = await supabase
        .from('jobs')
        .insert(insertDataWithoutToken)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Create job error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      job: { ...data, editToken },
      editToken,
    });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// PUT - Update job (no edit code required)
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
    if (updateData.company_name) updateFields.company_name = updateData.company_name;
    if (updateData.city !== undefined) updateFields.city = updateData.city;
    if (updateData.wilaya !== undefined) updateFields.wilaya = updateData.wilaya;
    if (updateData.experience_level) updateFields.experience_level = updateData.experience_level;
    if (updateData.salary_range !== undefined) updateFields.salary_range = updateData.salary_range;
    if (updateData.contact_email !== undefined) updateFields.contact_email = updateData.contact_email;
    if (updateData.contact_phone !== undefined) updateFields.contact_phone = updateData.contact_phone;

    const { data, error } = await supabase
      .from('jobs')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update job error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, job: data });
  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// DELETE - Delete job (no edit code required)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 });
    }

    const { error } = await supabase.from('jobs').delete().eq('id', id);

    if (error) {
      console.error('Delete job error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
