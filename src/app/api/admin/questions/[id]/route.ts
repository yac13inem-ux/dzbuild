import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// PATCH - Update question (pin/unpin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { pinned } = body;

    const { error } = await supabase
      .from('guest_posts')
      .update({ status: pinned ? 'pinned' : 'published' })
      .eq('id', id)
      .eq('section', 'EngineeringQuestions');

    if (error) {
      console.error('Error updating question:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

// DELETE - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete likes first
    await supabase.from('guest_post_likes').delete().eq('post_id', id);

    // Delete comments and their likes
    const { data: comments } = await supabase
      .from('guest_comments')
      .select('id')
      .eq('post_id', id);
    
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

    if (error) {
      console.error('Error deleting question:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف السؤال بنجاح' });
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
