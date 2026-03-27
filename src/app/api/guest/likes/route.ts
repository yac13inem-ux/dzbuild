import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Get client IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

// GET - Get like count and status for a post or comment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const commentId = searchParams.get('commentId');
    const ip = getClientIP(request);

    if (!postId && !commentId) {
      return NextResponse.json({ likes: 0, liked: false });
    }

    if (commentId) {
      // Get comment likes
      const { count: likes } = await supabase
        .from('guest_comment_likes')
        .select('id', { count: 'exact', head: true })
        .eq('comment_id', commentId);

      const { data: existingLike } = await supabase
        .from('guest_comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('ip_address', ip)
        .single();

      return NextResponse.json({
        likes: likes || 0,
        liked: !!existingLike,
      });
    } else {
      // Get post likes
      const { count: likes } = await supabase
        .from('guest_post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);

      const { data: existingLike } = await supabase
        .from('guest_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('ip_address', ip)
        .single();

      return NextResponse.json({
        likes: likes || 0,
        liked: !!existingLike,
      });
    }
  } catch (error) {
    console.error('Guest likes API error:', error);
    return NextResponse.json({ likes: 0, liked: false });
  }
}

// POST - Toggle like (add or remove)
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const body = await request.json();
    const { postId, commentId } = body;

    if (!postId && !commentId) {
      return NextResponse.json({ error: 'Post ID or Comment ID required' }, { status: 400 });
    }

    if (commentId) {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('guest_comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('ip_address', ip)
        .single();

      if (existingLike) {
        // Unlike - remove the like
        await supabase
          .from('guest_comment_likes')
          .delete()
          .eq('id', existingLike.id);

        // Get new count and update
        const { count: newCount } = await supabase
          .from('guest_comment_likes')
          .select('id', { count: 'exact', head: true })
          .eq('comment_id', commentId);

        await supabase
          .from('guest_comments')
          .update({ like_count: newCount || 0 })
          .eq('id', commentId);

        return NextResponse.json({ liked: false, likes: newCount || 0 });
      }

      // Add like
      const { error: insertError } = await supabase
        .from('guest_comment_likes')
        .insert({ comment_id: commentId, ip_address: ip });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      // Get new count and update
      const { count: newCount } = await supabase
        .from('guest_comment_likes')
        .select('id', { count: 'exact', head: true })
        .eq('comment_id', commentId);

      await supabase
        .from('guest_comments')
        .update({ like_count: newCount || 0 })
        .eq('id', commentId);

      return NextResponse.json({ liked: true, likes: newCount || 0 });
    } else {
      // Post likes
      const { data: existingLike } = await supabase
        .from('guest_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('ip_address', ip)
        .single();

      if (existingLike) {
        // Unlike - remove the like
        await supabase
          .from('guest_post_likes')
          .delete()
          .eq('id', existingLike.id);

        // Get new count and update
        const { count: newCount } = await supabase
          .from('guest_post_likes')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', postId);

        await supabase
          .from('guest_posts')
          .update({ like_count: newCount || 0 })
          .eq('id', postId);

        return NextResponse.json({ liked: false, likes: newCount || 0 });
      }

      // Add like
      const { error: insertError } = await supabase
        .from('guest_post_likes')
        .insert({ post_id: postId, ip_address: ip });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      // Get new count and update
      const { count: newCount } = await supabase
        .from('guest_post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);

      await supabase
        .from('guest_posts')
        .update({ like_count: newCount || 0 })
        .eq('id', postId);

      return NextResponse.json({ liked: true, likes: newCount || 0 });
    }
  } catch (error) {
    console.error('Guest like error:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
