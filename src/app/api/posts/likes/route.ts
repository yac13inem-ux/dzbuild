import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// POST - Toggle like
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, userId } = body;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists and get current like count
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('id, like_count')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Increment like count
    const newLikeCount = (post.like_count || 0) + 1;
    
    const { error: updateError } = await supabase
      .from('posts')
      .update({ like_count: newLikeCount })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating like count:', updateError);
      return NextResponse.json({ error: 'Failed to update like count' }, { status: 500 });
    }

    return NextResponse.json({ 
      liked: true, 
      likeCount: newLikeCount 
    });
  } catch (error) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ 
      error: 'Failed to toggle like',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// GET - Get like count for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const { data: post } = await supabase
      .from('posts')
      .select('like_count')
      .eq('id', postId)
      .single();

    return NextResponse.json({ 
      likeCount: post?.like_count || 0,
      liked: false
    });
  } catch (error) {
    console.error('Like fetch error:', error);
    return NextResponse.json({ likeCount: 0, liked: false });
  }
}
