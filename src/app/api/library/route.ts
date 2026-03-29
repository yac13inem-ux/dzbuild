import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch all library resources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('library_resources')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching library resources:', error);
      return NextResponse.json({ resources: [] });
    }

    // Transform data to match frontend interface
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
