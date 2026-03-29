import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id') || searchParams.get('postId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!postId) {
      return NextResponse.json({ comments: [] });
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

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error('Comments fetch error:', error);
    return NextResponse.json({ comments: [] });
  }
}

// POST - Create comment (supports both logged in users and guests)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Accept all naming conventions
    const postId = body.postId || body.post_id;
    const content = body.content;
    const authorId = body.authorId || body.author_id || null;
    const authorName = body.authorName || body.author_name || 'زائر';

    if (!postId) {
      return NextResponse.json(
        { error: 'معرف المنشور مطلوب' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 1) {
      return NextResponse.json(
        { error: 'محتوى التعليق مطلوب' },
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
        author_id: authorId,
        author_name: authorName,
        is_approved: true,
        like_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ 
        success: false,
        error: 'فشل في إنشاء التعليق: ' + error.message 
      }, { status: 500 });
    }

    // Try to update post comment count
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
      // Ignore error if post doesn't exist
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        like_count: 0,
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
    return NextResponse.json({ 
      success: false,
      error: 'فشل في إنشاء التعليق' 
    }, { status: 500 });
  }
}

// DELETE - Delete comment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json({ error: 'معرف التعليق مطلوب' }, { status: 400 });
    }

    // Get comment to find post_id
    const { data: comment } = await supabase
      .from('comments')
      .select('id, post_id')
      .eq('id', commentId)
      .single();

    // Delete comment
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      return NextResponse.json({ error: 'فشل في حذف التعليق' }, { status: 500 });
    }

    // Update post comment count
    if (comment?.post_id) {
      try {
        const { data: post } = await supabase
          .from('posts')
          .select('comment_count')
          .eq('id', comment.post_id)
          .single();
        
        if (post && post.comment_count > 0) {
          await supabase
            .from('posts')
            .update({ comment_count: post.comment_count - 1 })
            .eq('id', comment.post_id);
        }
      } catch (e) {
        // Ignore
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment deletion error:', error);
    return NextResponse.json({ error: 'فشل في حذف التعليق' }, { status: 500 });
  }
}
