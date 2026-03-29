import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { randomBytes } from 'crypto';

// Generate a unique edit token
function generateEditToken(): string {
  return randomBytes(32).toString('hex');
}

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// GET - Fetch posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const category = searchParams.get('category');

    let query = supabase
      .from('guest_posts')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('section', category);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Fetch posts error:', error);
      return NextResponse.json({ posts: [] });
    }

    const formattedPosts = (posts || []).map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      images: post.images,
      category: post.section,
      likeCount: post.like_count || 0,
      commentCount: post.comment_count || 0,
      viewCount: post.view_count || 0,
      createdAt: post.created_at,
      editToken: post.edit_token, // Include edit_token in response
      author: {
        id: 'guest',
        name: post.name || 'زائر',
        role: 'NORMAL_USER'
      }
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error: unknown) {
    console.error('Fetch posts error:', error);
    return NextResponse.json({ posts: [] });
  }
}

// POST - Create post (guest allowed)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, category, name } = body;

    if (!content || content.length < 3) {
      return NextResponse.json({ error: 'المحتوى مطلوب' }, { status: 400 });
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 });
    }

    // Generate unique edit token
    const editToken = generateEditToken();
    const postId = generateUUID();

    const { data: post, error } = await supabase
      .from('guest_posts')
      .insert({
        id: postId,
        name: name.trim(),
        title: title?.trim() || null,
        content: content.trim(),
        section: category || 'discussion',
        approved: true,
        like_count: 0,
        comment_count: 0,
        view_count: 0,
        edit_token: editToken,
      })
      .select()
      .single();

    if (error) {
      console.error('Create post error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        content: post.content,
        title: post.title,
        category: post.section,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        viewCount: post.view_count,
        createdAt: post.created_at,
        editToken: post.edit_token, // Return edit token to frontend
        author: { id: 'guest', name: post.name, role: 'NORMAL_USER' }
      }
    });
  } catch (error: unknown) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// PUT - Update post (requires edit_token or admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, title, category, editToken, isAdmin } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف المنشور مطلوب' }, { status: 400 });
    }

    if (!content || content.length < 3) {
      return NextResponse.json({ error: 'المحتوى مطلوب' }, { status: 400 });
    }

    // If not admin, verify edit_token
    if (!isAdmin) {
      if (!editToken) {
        return NextResponse.json({ error: 'رمز التحرير مطلوب' }, { status: 403 });
      }

      // Verify the edit_token matches
      const { data: post, error: fetchError } = await supabase
        .from('guest_posts')
        .select('edit_token')
        .eq('id', id)
        .single();

      if (fetchError || !post) {
        return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
      }

      if (post.edit_token !== editToken) {
        return NextResponse.json({ error: 'غير مصرح لك بتعديل هذا المنشور' }, { status: 403 });
      }
    }

    const { data: updatedPost, error } = await supabase
      .from('guest_posts')
      .update({
        content: content.trim(),
        title: title?.trim() || null,
        section: category,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update post error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      post: {
        id: updatedPost.id,
        content: updatedPost.content,
        title: updatedPost.title,
        category: updatedPost.section,
        likeCount: updatedPost.like_count,
        commentCount: updatedPost.comment_count,
        viewCount: updatedPost.view_count,
        createdAt: updatedPost.created_at,
        editToken: updatedPost.edit_token,
        author: { id: 'guest', name: updatedPost.name, role: 'NORMAL_USER' }
      }
    });
  } catch (error: unknown) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// DELETE - Delete post (requires edit_token or admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const editToken = searchParams.get('editToken');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'معرف المنشور مطلوب' }, { status: 400 });
    }

    // If not admin, verify edit_token
    if (!isAdmin) {
      if (!editToken) {
        return NextResponse.json({ error: 'رمز التحرير مطلوب' }, { status: 403 });
      }

      // Verify the edit_token matches
      const { data: post, error: fetchError } = await supabase
        .from('guest_posts')
        .select('edit_token')
        .eq('id', id)
        .single();

      if (fetchError || !post) {
        return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
      }

      if (post.edit_token !== editToken) {
        return NextResponse.json({ error: 'غير مصرح لك بحذف هذا المنشور' }, { status: 403 });
      }
    }

    // Delete likes first
    await supabase.from('guest_post_likes').delete().eq('post_id', id);

    // Delete comments and their likes
    const { data: comments } = await supabase.from('guest_comments').select('id').eq('post_id', id);
    if (comments) {
      for (const comment of comments) {
        await supabase.from('guest_comment_likes').delete().eq('comment_id', comment.id);
      }
    }
    await supabase.from('guest_comments').delete().eq('post_id', id);

    // Delete post
    const { error } = await supabase.from('guest_posts').delete().eq('id', id);

    if (error) {
      console.error('Delete post error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف المنشور بنجاح' });
  } catch (error: unknown) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
