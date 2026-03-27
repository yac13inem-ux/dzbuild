import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Generate a simple edit token
function generateEditToken(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

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

// GET - Fetch comments for a post or question
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType'); // 'post' or 'question'
    const targetId = searchParams.get('targetId');

    if (!targetType || !targetId) {
      return NextResponse.json({ comments: [] });
    }

    const comments = await db.externalComment.findMany({
      where: {
        targetType,
        targetId,
        isApproved: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ 
      comments: comments.map(c => ({
        id: c.id,
        authorName: c.authorName,
        content: c.content,
        likeCount: c.likeCount,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }))
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ comments: [] });
  }
}

// POST - Create a new external comment
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const body = await request.json();
    const { targetType, targetId, name, content, captchaAnswer } = body;

    // Validate CAPTCHA (frontend validates the math, we just check it exists)
    if (!captchaAnswer) {
      return NextResponse.json(
        { error: 'يرجى إكمال التحقق / Please complete CAPTCHA' },
        { status: 400 }
      );
    }

    // Validate input
    if (!targetType || !targetId || !name || !content) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة / All fields are required' },
        { status: 400 }
      );
    }

    // Validate target type
    if (!['post', 'question'].includes(targetType)) {
      return NextResponse.json(
        { error: 'نوع غير صالح / Invalid type' },
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

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'التعليق طويل جداً / Comment too long (max 2000 chars)' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'الاسم طويل جداً / Name too long (max 100 chars)' },
        { status: 400 }
      );
    }

    // Generate edit token for this comment author
    const editToken = generateEditToken();

    // Create comment
    const comment = await db.externalComment.create({
      data: {
        targetType,
        targetId,
        authorName: name.trim(),
        content: content.trim(),
        editToken,
        ipAddress: ip,
        userAgent,
        isApproved: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال التعليق بنجاح / Comment posted successfully',
      comment: {
        id: comment.id,
        authorName: comment.authorName,
        content: comment.content,
        editToken: comment.editToken,
        createdAt: comment.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'فشل إرسال التعليق / Failed to create comment' },
      { status: 500 }
    );
  }
}

// PUT - Edit a comment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, editToken } = body;

    if (!id || !content || !editToken) {
      return NextResponse.json(
        { error: 'مطلوب معرف التعليق والمحتوى والتوكين / Comment ID, content and token required' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 3 || content.length > 2000) {
      return NextResponse.json(
        { error: 'محتوى غير صالح / Invalid content' },
        { status: 400 }
      );
    }

    // Find the comment
    const existingComment = await db.externalComment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: 'التعليق غير موجود / Comment not found' },
        { status: 404 }
      );
    }

    // Verify edit token
    if (existingComment.editToken !== editToken) {
      return NextResponse.json(
        { error: 'غير مصرح بالتعديل / Not authorized to edit' },
        { status: 403 }
      );
    }

    // Update comment
    const comment = await db.externalComment.update({
      where: { id },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث التعليق / Comment updated',
      comment: {
        id: comment.id,
        content: comment.content,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'فشل تحديث التعليق / Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const editToken = searchParams.get('editToken');
    const isAdmin = searchParams.get('admin') === 'true';

    if (!id) {
      return NextResponse.json(
        { error: 'مطلوب معرف التعليق / Comment ID required' },
        { status: 400 }
      );
    }

    // Find the comment
    const existingComment = await db.externalComment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return NextResponse.json(
        { error: 'التعليق غير موجود / Comment not found' },
        { status: 404 }
      );
    }

    // Verify permission (admin or owner with edit token)
    if (!isAdmin && existingComment.editToken !== editToken) {
      return NextResponse.json(
        { error: 'غير مصرح بالحذف / Not authorized to delete' },
        { status: 403 }
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
