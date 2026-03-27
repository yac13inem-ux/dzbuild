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

// GET - Fetch questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);
    const category = searchParams.get('category');

    let query = supabase
      .from('guest_posts')
      .select('*')
      .eq('approved', true)
      .eq('section', 'EngineeringQuestions')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) return NextResponse.json({ questions: [] });

    const questions = (data || []).map(q => ({
      id: q.id,
      title: q.title || q.content?.slice(0, 100),
      content: q.content,
      category: q.category || 'concrete',
      answers_count: q.comment_count || 0,
      votes_count: q.like_count || 0,
      views_count: q.view_count || 0,
      is_solved: false,
      is_pinned: false,
      created_at: q.created_at,
      author_name: q.name || 'زائر',
      author_role: 'NORMAL_USER',
      editToken: q.edit_token, // Include for frontend ownership check
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    return NextResponse.json({ questions: [] });
  }
}

// POST - Create question
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, authorName, category } = body;

    if (!title || title.length < 5) {
      return NextResponse.json({ error: 'العنوان مطلوب (5 أحرف على الأقل)' }, { status: 400 });
    }

    // Generate unique edit token
    const editToken = generateEditToken();
    const questionId = generateUUID();

    const { data, error } = await supabase
      .from('guest_posts')
      .insert({
        id: questionId,
        name: authorName?.trim() || 'زائر',
        title: title.trim(),
        content: content?.trim() || null,
        section: 'EngineeringQuestions',
        category: category || 'concrete',
        approved: true,
        like_count: 0,
        comment_count: 0,
        view_count: 0,
        edit_token: editToken,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      question: {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        answers_count: 0,
        votes_count: 0,
        views_count: 0,
        is_solved: false,
        created_at: data.created_at,
        author_name: data.name,
        editToken: data.edit_token, // Return edit token
      }
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// PUT - Update question (requires edit_token or admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, category, editToken, isAdmin } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف السؤال مطلوب' }, { status: 400 });
    }

    if (!title || title.length < 5) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 });
    }

    // If not admin, verify edit_token
    if (!isAdmin) {
      if (!editToken) {
        return NextResponse.json({ error: 'رمز التحرير مطلوب' }, { status: 403 });
      }

      // Verify the edit_token matches
      const { data: question, error: fetchError } = await supabase
        .from('guest_posts')
        .select('edit_token')
        .eq('id', id)
        .eq('section', 'EngineeringQuestions')
        .single();

      if (fetchError || !question) {
        return NextResponse.json({ error: 'السؤال غير موجود' }, { status: 404 });
      }

      if (question.edit_token !== editToken) {
        return NextResponse.json({ error: 'غير مصرح لك بتعديل هذا السؤال' }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from('guest_posts')
      .update({
        title: title.trim(),
        content: content?.trim() || null,
        category: category,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('section', 'EngineeringQuestions')
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      success: true,
      question: {
        id: data.id,
        title: data.title,
        content: data.content,
        category: data.category,
        answers_count: data.comment_count || 0,
        votes_count: data.like_count || 0,
        views_count: data.view_count || 0,
        created_at: data.created_at,
        author_name: data.name,
        editToken: data.edit_token,
      }
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// DELETE - Delete question (requires edit_token or admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const editToken = searchParams.get('editToken');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'معرف السؤال مطلوب' }, { status: 400 });
    }

    // If not admin, verify edit_token
    if (!isAdmin) {
      if (!editToken) {
        return NextResponse.json({ error: 'رمز التحرير مطلوب' }, { status: 403 });
      }

      // Verify the edit_token matches
      const { data: question, error: fetchError } = await supabase
        .from('guest_posts')
        .select('edit_token')
        .eq('id', id)
        .eq('section', 'EngineeringQuestions')
        .single();

      if (fetchError || !question) {
        return NextResponse.json({ error: 'السؤال غير موجود' }, { status: 404 });
      }

      if (question.edit_token !== editToken) {
        return NextResponse.json({ error: 'غير مصرح لك بحذف هذا السؤال' }, { status: 403 });
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

    // Delete question
    const { error } = await supabase
      .from('guest_posts')
      .delete()
      .eq('id', id)
      .eq('section', 'EngineeringQuestions');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, message: 'تم حذف السؤال بنجاح' });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
