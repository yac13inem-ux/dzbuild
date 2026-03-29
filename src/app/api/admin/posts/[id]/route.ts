import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// PATCH - Update post (pin/unpin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { pinned, status } = body;

    const updateData: Record<string, unknown> = {};
    
    if (pinned !== undefined) {
      updateData.status = pinned ? 'pinned' : 'published';
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    const { error } = await supabase
      .from('guest_posts')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE - Delete post
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

    // Delete post
    const { error } = await supabase
      .from('guest_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف المنشور بنجاح' });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
