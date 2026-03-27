import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch single library resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabase
      .from('library_resources')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    
    const resource = {
      id: data.id,
      title: data.title,
      titleAr: data.title_ar,
      titleFr: data.title_fr,
      description: data.description,
      category: data.category,
      fileUrl: data.file_url,
      thumbnail: data.thumbnail,
      downloadCount: data.download_count,
      viewCount: data.view_count,
      isFeatured: data.is_featured,
      isPublished: data.is_published,
      tags: data.tags,
      author: data.author,
      createdAt: data.created_at,
    };
    
    return NextResponse.json({ resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json({ error: 'Failed to fetch resource' }, { status: 500 });
  }
}

// PUT - Update library resource
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    console.log('Updating library resource:', id, data);
    
    const { data: resource, error } = await supabase
      .from('library_resources')
      .update({
        title: data.title,
        title_ar: data.titleAr,
        title_fr: data.titleFr,
        description: data.description,
        thumbnail: data.thumbnail,
        file_url: data.fileUrl,
        category: data.category,
        tags: data.tags,
        author: data.author,
        is_featured: data.isFeatured,
        is_published: data.isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating resource:', error);
      return NextResponse.json({ 
        error: 'Failed to update resource: ' + error.message 
      }, { status: 500 });
    }
    
    const response = {
      id: resource.id,
      title: resource.title,
      titleAr: resource.title_ar,
      titleFr: resource.title_fr,
      description: resource.description,
      category: resource.category,
      fileUrl: resource.file_url,
      thumbnail: resource.thumbnail,
      downloadCount: resource.download_count,
      viewCount: resource.view_count,
      isFeatured: resource.is_featured,
      isPublished: resource.is_published,
      tags: resource.tags,
      author: resource.author,
      createdAt: resource.created_at,
    };
    
    return NextResponse.json({ resource: response });
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

// DELETE - Delete library resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('Deleting library resource:', id);
    
    const { error } = await supabase
      .from('library_resources')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting resource:', error);
      return NextResponse.json({ 
        error: 'Failed to delete resource: ' + error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
