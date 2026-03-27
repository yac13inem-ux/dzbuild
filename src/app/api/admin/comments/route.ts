import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-utils';

// GET - Fetch all comments for admin
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح / Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;

    const [comments, total] = await Promise.all([
      db.externalComment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.externalComment.count({ where }),
    ]);

    return NextResponse.json({
      comments: comments.map(c => ({
        id: c.id,
        targetType: c.targetType,
        targetId: c.targetId,
        authorName: c.authorName,
        content: c.content,
        isApproved: c.isApproved,
        likeCount: c.likeCount,
        ipAddress: c.ipAddress,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching admin comments:', error);
    return NextResponse.json(
      { error: 'فشل جلب التعليقات / Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment (admin)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح / Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'مطلوب معرف التعليق / Comment ID required' },
        { status: 400 }
      );
    }

    // Delete comment
    await db.externalComment.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف التعليق / Comment deleted',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'فشل حذف التعليق / Failed to delete comment' },
      { status: 500 }
    );
  }
}

// PATCH - Approve/Reject a comment (admin)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح / Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, isApproved } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'مطلوب معرف التعليق / Comment ID required' },
        { status: 400 }
      );
    }

    // Update comment approval status
    const comment = await db.externalComment.update({
      where: { id },
      data: { isApproved },
    });

    return NextResponse.json({
      success: true,
      message: isApproved ? 'تم الموافقة على التعليق / Comment approved' : 'تم رفض التعليق / Comment rejected',
      comment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'فشل تحديث التعليق / Failed to update comment' },
      { status: 500 }
    );
  }
}
