import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-utils';

// DELETE - Delete comment (admin or with edit code)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const editCode = searchParams.get('editCode');

    // Get comment to find post ID and verify permissions
    const comment = await db.guestComment.findUnique({
      where: { id },
      select: { postId: true, editCode: true },
    });

    if (!comment) {
      return NextResponse.json({
        error: 'التعليق غير موجود / Comment not found'
      }, { status: 404 });
    }

    // Check if user is admin
    const user = await getAuthUser();
    const isAdmin = user && user.role === 'ADMIN';

    // Check if edit code matches (for guest deletion)
    const isEditCodeValid = editCode && editCode === comment.editCode;

    if (!isAdmin && !isEditCodeValid) {
      return NextResponse.json({
        error: 'غير مصرح / Unauthorized - Admin or valid edit code required'
      }, { status: 401 });
    }

    // Delete comment
    await db.guestComment.delete({
      where: { id },
    });

    // Decrement comment count
    await db.guestPost.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Comment deletion error:', error);
    return NextResponse.json({
      error: 'Failed to delete comment',
      details: error.message
    }, { status: 500 });
  }
}
