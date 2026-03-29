import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('guest_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return NextResponse.json({ posts: [] });

    const posts = (data || []).map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      post_type: p.section,
      status: 'published',
      author_id: null,
      created_at: p.created_at,
      profiles: { name: p.name || 'زائر' },
    }));

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}
