import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-utils';

// GET - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await db.guestPost.findUnique({
      where: { id },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({
        error: 'Post not found'
      }, { status: 404 });
    }

    // Increment view count
    await db.guestPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Return post without editCode
    const { editCode, ...safePost } = post;
    return NextResponse.json({ post: safePost });
  } catch (error: any) {
    console.error('Guest post fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch post',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - Update post (owner with editCode or admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, content, category, editCode } = body;

    // Check if user is admin
    const user = await getAuthUser();
    const isAdmin = user && user.role === 'ADMIN';

    // If not admin, verify editCode
    if (!isAdmin) {
      if (!editCode) {
        return NextResponse.json({
          error: 'رمز التحرير مطلوب / Edit code is required',
          code: 'EDIT_CODE_REQUIRED'
        }, { status: 400 });
      }

      const post = await db.guestPost.findUnique({
        where: { id },
        select: { editCode: true },
      });

      if (!post || post.editCode !== editCode) {
        return NextResponse.json({
          error: 'رمز التحرير غير صحيح / Invalid edit code',
          code: 'INVALID_EDIT_CODE'
        }, { status: 403 });
      }
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({
        error: 'الاسم مطلوب / Name is required',
        code: 'NAME_REQUIRED'
      }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({
        error: 'المحتوى مطلوب / Content is required',
        code: 'CONTENT_REQUIRED'
      }, { status: 400 });
    }

    const updatedPost = await db.guestPost.update({
      where: { id },
      data: {
        name: name.trim(),
        content: content.trim(),
        category: category || null,
      },
    });

    // Return post without editCode
    const { editCode: _, ...safePost } = updatedPost;
    return NextResponse.json({ post: safePost });
  } catch (error: any) {
    console.error('Guest post update error:', error);
    return NextResponse.json({
      error: 'Failed to update post',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Delete post (owner with editCode or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get editCode from query params or body
    const url = new URL(request.url);
    const editCodeFromQuery = url.searchParams.get('editCode');
    
    let editCodeFromBody = null;
    try {
      const body = await request.json();
      editCodeFromBody = body.editCode;
    } catch {
      // No body, use query param
    }
    
    const editCode = editCodeFromBody || editCodeFromQuery;

    // Check if user is admin
    const user = await getAuthUser();
    const isAdmin = user && user.role === 'ADMIN';

    // If not admin, verify editCode
    if (!isAdmin) {
      if (!editCode) {
        return NextResponse.json({
          error: 'رمز التحرير مطلوب / Edit code is required',
          code: 'EDIT_CODE_REQUIRED'
        }, { status: 400 });
      }

      const post = await db.guestPost.findUnique({
        where: { id },
        select: { editCode: true },
      });

      if (!post || post.editCode !== editCode) {
        return NextResponse.json({
          error: 'رمز التحرير غير صحيح / Invalid edit code',
          code: 'INVALID_EDIT_CODE'
        }, { status: 403 });
      }
    }

    // Delete all comments first
    await db.guestComment.deleteMany({
      where: { postId: id },
    });

    // Delete all likes
    await db.guestLike.deleteMany({
      where: { postId: id },
    });

    // Delete post
    await db.guestPost.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Guest post deletion error:', error);
    return NextResponse.json({
      error: 'Failed to delete post',
      details: error.message
    }, { status: 500 });
  }
}
