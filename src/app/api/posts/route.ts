import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch posts (limited for performance)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);
    const category = searchParams.get('category');

    let query = supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ posts: [] });
    }

    // Transform to frontend interface
    const formattedPosts = (data || []).map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      images: post.images,
      category: post.category,
      like_count: post.like_count || 0,
      comment_count: post.comment_count || 0,
      view_count: post.view_count || 0,
      created_at: post.created_at,
      author_name: post.author_name || 'زائر',
      author_id: post.author_id,
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Fetch posts error:', error);
    return NextResponse.json({ posts: [] }, { status: 500 });
  }
}

// POST - Create post (works for both logged-in users and guests)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, category, images, authorName, authorId, editToken } = body;

    if (!content || content.length < 5) {
      return NextResponse.json({ 
        error: 'المحتوى مطلوب / Content is required (min 5 chars)' 
      }, { status: 400 });
    }

    // Generate unique ID
    const id = `post-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        id,
        content: content.trim(),
        title: title || null,
        category: category || 'discussion',
        images: images || null,
        author_id: authorId || null,
        author_name: authorName || 'زائر',
        edit_token: editToken || id,
        is_published: true,
        like_count: 0,
        comment_count: 0,
        view_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Create post error:', error);
      return NextResponse.json({ 
        error: 'Failed to create post: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        content: post.content,
        title: post.title,
        category: post.category,
        images: post.images,
        like_count: post.like_count,
        comment_count: post.comment_count,
        view_count: post.view_count,
        created_at: post.created_at,
        edit_token: post.edit_token,
        author: {
          id: post.author_id || 'guest',
          name: post.author_name || 'زائر',
          role: 'USER'
        }
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
