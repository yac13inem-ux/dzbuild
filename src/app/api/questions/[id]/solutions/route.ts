import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch answers
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('guest_comments')
      .select('*')
      .eq('post_id', id)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ solutions: [] });

    const solutions = (data || []).map(c => ({
      id: c.id,
      content: c.content,
      isAccepted: false,
      upvoteCount: c.like_count || 0,
      createdAt: c.created_at,
      author_name: c.name || 'زائر',
      author_avatar: null,
      author_role: 'NORMAL_USER',
    }));

    return NextResponse.json({ solutions });
  } catch {
    return NextResponse.json({ solutions: [] });
  }
}

// POST - Create answer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, authorName } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'المحتوى مطلوب' }, { status: 400 });
    }

    if (!authorName?.trim()) {
      return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('guest_comments')
      .insert({
        post_id: id,
        name: authorName.trim(),
        content: content.trim(),
        approved: true,
        like_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating answer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Increment comment count manually
    try {
      const { data: post } = await supabase
        .from('guest_posts')
        .select('comment_count')
        .eq('id', id)
        .single();
      
      if (post) {
        await supabase
          .from('guest_posts')
          .update({ comment_count: (post.comment_count || 0) + 1 })
          .eq('id', id);
      }
    } catch (e) {
      console.log('Could not update comment count');
    }

    // Generate a simple token for frontend ownership tracking
    const editToken = Buffer.from(`${data.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      solution: {
        id: data.id,
        content: data.content,
        isAccepted: false,
        upvoteCount: 0,
        createdAt: data.created_at,
        editToken: editToken, // Return for frontend storage
        author_name: data.name,
        author_avatar: null,
        author_role: 'NORMAL_USER',
      }
    });
  } catch (error: any) {
    console.error('Create solution error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ' }, { status: 500 });
  }
}

// PUT - Edit answer (admin only for now)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { solutionId, content, isAdmin } = body;

    if (!solutionId) {
      return NextResponse.json({ error: 'معرف الإجابة مطلوب' }, { status: 400 });
    }

    if (!content || content.trim().length < 3) {
      return NextResponse.json({ error: 'المحتوى مطلوب (3 أحرف على الأقل)' }, { status: 400 });
    }

    // Only admin can edit for now
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل هذه الإجابة' }, { status: 403 });
    }

    // Update answer
    const { data: updatedSolution, error } = await supabase
      .from('guest_comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', solutionId)
      .eq('post_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating answer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      solution: {
        id: updatedSolution.id,
        content: updatedSolution.content,
        isAccepted: false,
        upvoteCount: updatedSolution.like_count || 0,
        createdAt: updatedSolution.created_at,
        author_name: updatedSolution.name,
        author_avatar: null,
        author_role: 'NORMAL_USER',
      },
    });
  } catch (error: any) {
    console.error('Edit solution error:', error);
    return NextResponse.json({ error: error.message || 'فشل تعديل الإجابة' }, { status: 500 });
  }
}

// DELETE - Delete answer (admin only for now)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const solutionId = searchParams.get('solutionId');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    if (!solutionId) {
      return NextResponse.json({ error: 'معرف الإجابة مطلوب' }, { status: 400 });
    }

    // Only admin can delete for now
    if (!isAdmin) {
      return NextResponse.json({ error: 'غير مصرح لك بحذف هذه الإجابة' }, { status: 403 });
    }

    // Delete answer
    const { error } = await supabase
      .from('guest_comments')
      .delete()
      .eq('id', solutionId)
      .eq('post_id', id);

    if (error) {
      console.error('Error deleting answer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update comment count
    try {
      const { data: post } = await supabase
        .from('guest_posts')
        .select('comment_count')
        .eq('id', id)
        .single();
      
      if (post && post.comment_count > 0) {
        await supabase
          .from('guest_posts')
          .update({ comment_count: post.comment_count - 1 })
          .eq('id', id);
      }
    } catch (e) {
      console.log('Could not update comment count');
    }

    return NextResponse.json({ success: true, message: 'تم حذف الإجابة بنجاح' });
  } catch (error: any) {
    console.error('Delete solution error:', error);
    return NextResponse.json({ error: error.message || 'فشل حذف الإجابة' }, { status: 500 });
  }
}
