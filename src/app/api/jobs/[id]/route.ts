import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// PUT - Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('Updating job:', id, body);
    
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    // Only update fields that are provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.company_name !== undefined) updateData.company_name = body.company_name;
    if (body.company_logo !== undefined) updateData.company_logo = body.company_logo;
    if (body.wilaya !== undefined) updateData.wilaya = body.wilaya;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.experience_level !== undefined) updateData.experience_level = body.experience_level;
    if (body.salary_range !== undefined) updateData.salary_range = body.salary_range;
    if (body.job_type !== undefined) updateData.job_type = body.job_type;
    if (body.contact_email !== undefined) updateData.contact_email = body.contact_email;
    if (body.contact_phone !== undefined) updateData.contact_phone = body.contact_phone;
    if (body.deadline !== undefined) updateData.deadline = body.deadline;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.status !== undefined) updateData.status = body.status;
    
    const { data: job, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating job:', error);
      return NextResponse.json({ 
        error: 'Failed to update job: ' + error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

// DELETE - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('Deleting job:', id);
    
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting job:', error);
      return NextResponse.json({ 
        error: 'Failed to delete job: ' + error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
