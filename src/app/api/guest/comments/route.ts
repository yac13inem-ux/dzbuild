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

// No time limit - ownership is verified via localStorage token

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ comments: [] });
    }

    const { data: comments, error } = await supabase
      .from('guest_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('approved', true)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Fetch comments error:', error);
      return NextResponse.json({ comments: [] });
    }

    const formattedComments = (comments || []).map(c => ({
      id: c.id,
      postId: c.post_id,
      content: c.content,
      likeCount: c.like_count || 0,
      createdAt: c.created_at,
      author: {
        id: 'guest',
        name: c.name || 'زائر',
        avatar: null,
      },
    }));

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error('Guest comments API error:', error);
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const body = await request.json();
    const { postId, name, content, captchaAnswer } = body;

    // Validate CAPTCHA (simple check - can be skipped for logged in users)
    if (!captchaAnswer) {
      return NextResponse.json(
        { error: 'يرجى إكمال التحقق / Please complete CAPTCHA' },
        { status: 400 }
      );
    }

    // Validate input
    if (!postId || !name || !content) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة / All fields are required' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 3) {
      return NextResponse.json(
        { error: 'التعليق قصير جداً / Comment too short (min 3 chars)' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'التعليق طويل جداً / Comment too long (max 1000 chars)' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'الاسم طويل جداً / Name too long (max 100 chars)' },
        { status: 400 }
      );
    }

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('guest_posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'المنشور غير موجود / Post not found' }, { status: 404 });
    }

    // Create comment - Supabase generates UUID automatically (no edit_token column needed)
    const { data: comment, error: createError } = await supabase
      .from('guest_comments')
      .insert({
        post_id: postId,
        name: name.trim(),
        content: content.trim(),
        ip_address: ip,
        user_agent: userAgent,
        approved: true,
        like_count: 0,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create comment error:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Update comment count on post
    const { count } = await supabase
      .from('guest_comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);

    await supabase
      .from('guest_posts')
      .update({ comment_count: count || 0 })
      .eq('id', postId);

    // Generate a simple token based on ID and timestamp for ownership tracking
    const editToken = Buffer.from(`${comment.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      message: 'تم إرسال التعليق بنجاح / Comment posted successfully',
      comment: {
        id: comment.id,
        postId: comment.post_id,
        content: comment.content,
        likeCount: comment.like_count,
        createdAt: comment.created_at,
        editToken: editToken, // Return for frontend storage
        author: {
          id: 'guest',
          name: comment.name || 'زائر',
          avatar: null,
        },
      },
    });
  } catch (error) {
    console.error('Create guest comment error:', error);
    return NextResponse.json({ error: 'فشل إرسال التعليق / Failed to create comment' }, { status: 500 });
  }
}

// PUT - Edit comment (ownership verified on frontend via localStorage)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف التعليق مطلوب' }, { status: 400 });
    }

    if (!content || content.trim().length < 3) {
      return NextResponse.json({ error: 'المحتوى مطلوب (3 أحرف على الأقل)' }, { status: 400 });
    }

    // Check if comment exists
    const { data: comment, error: fetchError } = await supabase
      .from('guest_comments')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'التعليق غير موجود' }, { status: 404 });
    }

    // Update comment
    const { data: updatedComment, error } = await supabase
      .from('guest_comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: updatedComment.id,
        postId: updatedComment.post_id,
        content: updatedComment.content,
        likeCount: updatedComment.like_count,
        createdAt: updatedComment.created_at,
        author: {
          id: 'guest',
          name: updatedComment.name || 'زائر',
          avatar: null,
        },
      },
    });
  } catch (error) {
    console.error('Edit comment error:', error);
    return NextResponse.json({ error: 'فشل تعديل التعليق' }, { status: 500 });
  }
}

// DELETE - Delete comment (ownership verified on frontend via localStorage)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف التعليق مطلوب' }, { status: 400 });
    }

    // Get the comment to find post_id
    const { data: comment, error: fetchError } = await supabase
      .from('guest_comments')
      .select('id, post_id')
      .eq('id', id)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'التعليق غير موجود' }, { status: 404 });
    }

    // Delete comment
    const { error } = await supabase
      .from('guest_comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update comment count on post
    if (comment.post_id) {
      const { count } = await supabase
        .from('guest_comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', comment.post_id);

      await supabase
        .from('guest_posts')
        .update({ comment_count: count || 0 })
        .eq('id', comment.post_id);
    }

    return NextResponse.json({ success: true, message: 'تم حذف التعليق بنجاح' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: 'فشل حذف التعليق' }, { status: 500 });
  }
}
