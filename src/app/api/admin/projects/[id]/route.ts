import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// PUT - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    console.log('Updating project:', id, data);
    
    const { data: project, error } = await supabase
      .from('projects')
      .update({
        title: data.title,
        title_ar: data.titleAr,
        title_fr: data.titleFr,
        description: data.description,
        description_ar: data.descriptionAr,
        description_fr: data.descriptionFr,
        status: data.status,
        category: data.category,
        progress: data.progress,
        location: data.location,
        budget: data.budget,
        start_date: data.startDate,
        end_date: data.endDate,
        images: data.image,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json({ 
        error: 'Failed to update project: ' + error.message 
      }, { status: 500 });
    }
    
    const response = {
      id: project.id,
      title: project.title,
      titleAr: project.title_ar,
      titleFr: project.title_fr,
      description: project.description,
      descriptionAr: project.description_ar,
      descriptionFr: project.description_fr,
      status: project.status,
      category: project.category,
      progress: project.progress,
      location: project.location,
      budget: project.budget,
      startDate: project.start_date,
      endDate: project.end_date,
      images: project.images,
      createdAt: project.created_at,
    };
    
    return NextResponse.json({ project: response });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('Deleting project:', id);
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json({ 
        error: 'Failed to delete project: ' + error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
