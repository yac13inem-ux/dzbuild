import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id') || searchParams.get('postId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ comments: [] });
    }

    // Format comments with author info
    const formattedComments = (comments || []).map((comment) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      like_count: comment.like_count || 0,
      author: {
        id: comment.author_id || 'guest',
        name: comment.author_name || 'زائر',
        avatar: null,
        role: 'USER'
      },
    }));

    return NextResponse.json({
      comments: formattedComments,
      total: formattedComments.length
    });
  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json({ comments: [], error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST - Create new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Accept both naming conventions
    const postId = body.postId || body.post_id;
    const content = body.content;
    const authorId = body.authorId || body.author_id;
    const authorName = body.authorName || body.author_name;

    if (!postId || !content || content.trim().length < 1) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        id,
        post_id: postId,
        content: content.trim(),
        author_id: authorId || null,
        author_name: authorName || 'زائر',
        is_approved: true,
        like_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ 
        error: 'Failed to create comment: ' + error.message 
      }, { status: 500 });
    }

    // Update post comment count
    try {
      const { data: currentPost } = await supabase
        .from('posts')
        .select('comment_count')
        .eq('id', postId)
        .single();
      
      if (currentPost) {
        await supabase
          .from('posts')
          .update({ comment_count: (currentPost.comment_count || 0) + 1 })
          .eq('id', postId);
      }
    } catch (e) {
      console.log('Could not update comment count');
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        author: {
          id: comment.author_id || 'guest',
          name: comment.author_name || 'زائر',
          avatar: null,
          role: 'USER'
        },
      }
    });
  } catch (error) {
    console.error('Comment creation error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

// DELETE - Delete comment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');
    const postId = searchParams.get('postId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    // Get comment to verify and get post_id
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('id, post_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Delete comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }

    // Update post comment count
    const targetPostId = postId || comment.post_id;
    if (targetPostId) {
      try {
        const { data: post } = await supabase
          .from('posts')
          .select('comment_count')
          .eq('id', targetPostId)
          .single();
        
        if (post && post.comment_count > 0) {
          await supabase
            .from('posts')
            .update({ comment_count: post.comment_count - 1 })
            .eq('id', targetPostId);
        }
      } catch (e) {
        console.log('Could not update comment count');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
