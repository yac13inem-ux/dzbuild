import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-utils';

// DELETE - Delete a guest post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const user = await getAuthUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({
        error: 'Unauthorized - Admin access required'
      }, { status: 403 });
    }

    const { id } = await params;

    // Check if post exists
    const post = await db.guestPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({
        error: 'Post not found'
      }, { status: 404 });
    }

    // Delete all comments first
    await db.guestComment.deleteMany({
      where: { postId: id },
    });

    // Delete all likes
    await db.guestLike.deleteMany({
      where: { postId: id },
    });

    // Delete the post
    await db.guestPost.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error: any) {
    console.error('Admin guest post deletion error:', error);
    return NextResponse.json({
      error: 'Failed to delete post',
      details: error.message
    }, { status: 500 });
  }
}

// PATCH - Update guest post status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const user = await getAuthUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({
        error: 'Unauthorized - Admin access required'
      }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { approved, name, content, category } = body;

    const updateData: any = {};
    if (approved !== undefined) updateData.approved = approved;
    if (name !== undefined) updateData.name = name;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;

    const post = await db.guestPost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Admin guest post update error:', error);
    return NextResponse.json({
      error: 'Failed to update post',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - Full update guest post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const user = await getAuthUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({
        error: 'Unauthorized - Admin access required'
      }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, content, category, approved } = body;

    if (!name || !content) {
      return NextResponse.json({
        error: 'Name and content are required'
      }, { status: 400 });
    }

    const post = await db.guestPost.update({
      where: { id },
      data: {
        name,
        content,
        category: category || null,
        approved: approved !== undefined ? approved : true,
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Admin guest post update error:', error);
    return NextResponse.json({
      error: 'Failed to update post',
      details: error.message
    }, { status: 500 });
  }
}
