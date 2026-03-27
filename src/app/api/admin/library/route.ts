import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch all library resources for admin
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('library_resources')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching library resources:', error);
      return NextResponse.json({ resources: [] });
    }
    
    // Transform to match frontend interface
    const resources = (data || []).map(r => ({
      id: r.id,
      title: r.title,
      titleAr: r.title_ar,
      titleFr: r.title_fr,
      description: r.description,
      category: r.category || 'guide',
      fileUrl: r.file_url,
      thumbnail: r.thumbnail,
      downloadCount: r.download_count || 0,
      viewCount: r.view_count || 0,
      isFeatured: r.is_featured || false,
      isPublished: r.is_published !== false,
      tags: r.tags,
      author: r.author,
      createdAt: r.created_at,
    }));
    
    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error fetching library resources:', error);
    return NextResponse.json({ resources: [] }, { status: 500 });
  }
}

// POST - Create new library resource
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Creating library resource with data:', data);
    
    // Generate a unique ID
    const id = `lib-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    const { data: resource, error } = await supabase
      .from('library_resources')
      .insert({
        id,
        title: data.title || '',
        title_ar: data.titleAr || null,
        title_fr: data.titleFr || null,
        description: data.description || null,
        thumbnail: data.thumbnail || null,
        file_url: data.fileUrl || null,
        category: data.category || 'guide',
        tags: data.tags || null,
        author: data.author || null,
        is_featured: data.isFeatured || false,
        is_published: data.isPublished !== false,
        download_count: 0,
        view_count: 0,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating library resource:', error);
      return NextResponse.json({ 
        error: 'Failed to create resource: ' + error.message 
      }, { status: 500 });
    }
    
    // Transform response
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
    
    console.log('Created resource:', response);
    
    return NextResponse.json({ resource: response });
  } catch (error) {
    console.error('Error creating library resource:', error);
    return NextResponse.json({ 
      error: 'Failed to create resource' 
    }, { status: 500 });
  }
}
