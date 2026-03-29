import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Get single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json({ error: 'Failed to get job' }, { status: 500 });
  }
}

// PUT - Update job (requires edit_token for guest posts)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      title,
      description,
      category,
      company_name,
      city,
      wilaya,
      salary_range,
      experience_level,
      contact_email,
      contact_phone,
      deadline,
      status,
      edit_token,
    } = body;

    // Verify edit_token for guest posts
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('id, edit_token')
      .eq('id', id)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check edit_token if job has one
    if (existingJob.edit_token && existingJob.edit_token !== edit_token) {
      return NextResponse.json({ 
        error: 'Invalid edit token. You do not have permission to edit this job.' 
      }, { status: 403 });
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .update({
        title,
        description,
        category,
        company_name,
        city,
        wilaya,
        salary_range,
        experience_level,
        contact_email,
        contact_phone,
        deadline,
        status: status || 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to update job: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Update job error:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

// DELETE - Delete job (requires edit_token for guest posts)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const edit_token = searchParams.get('edit_token');
    
    // Verify edit_token for guest posts
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('id, edit_token')
      .eq('id', id)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check edit_token if job has one
    if (existingJob.edit_token && existingJob.edit_token !== edit_token) {
      return NextResponse.json({ 
        error: 'Invalid edit token. You do not have permission to delete this job.' 
      }, { status: 403 });
    }
    
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to delete job: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
