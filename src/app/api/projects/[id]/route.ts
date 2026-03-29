import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json({ error: 'Failed to get project' }, { status: 500 });
  }
}

// PUT - Update project (requires edit_token for guest posts)
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
      status,
      progress,
      budget,
      location,
      city,
      wilaya,
      start_date,
      end_date,
      images,
      edit_token,
    } = body;

    // Verify edit_token for guest posts
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id, edit_token')
      .eq('id', id)
      .single();

    if (fetchError || !existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check edit_token if project has one
    if (existingProject.edit_token && existingProject.edit_token !== edit_token) {
      return NextResponse.json({ 
        error: 'Invalid edit token. You do not have permission to edit this project.' 
      }, { status: 403 });
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        title,
        description,
        category,
        status: status || 'planning',
        progress: parseInt(progress) || 0,
        budget: parseFloat(budget) || 0,
        location: location || city,
        wilaya,
        start_date,
        end_date,
        images,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to update project: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - Delete project (requires edit_token for guest posts)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const edit_token = searchParams.get('edit_token');
    
    // Verify edit_token for guest posts
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id, edit_token')
      .eq('id', id)
      .single();

    if (fetchError || !existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check edit_token if project has one
    if (existingProject.edit_token && existingProject.edit_token !== edit_token) {
      return NextResponse.json({ 
        error: 'Invalid edit token. You do not have permission to delete this project.' 
      }, { status: 403 });
    }
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to delete project: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
