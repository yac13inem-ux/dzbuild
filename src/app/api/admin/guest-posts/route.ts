import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth-utils';

// GET - Get all guest posts for admin
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getAuthUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({
        error: 'Unauthorized - Admin access required'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section'); // 'posts' or 'questions'

    const where: any = {};
    if (section) {
      where.section = section;
    }

    const posts = await db.guestPost.findMany({
      where,
      include: {
        comments: {
          select: {
            id: true,
            name: true,
            content: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get like counts separately
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likesCount = await db.guestLike.count({
          where: { postId: post.id },
        });
        return {
          ...post,
          likesCount,
          commentCount: post._count.comments,
        };
      })
    );

    return NextResponse.json({ posts: postsWithLikes });
  } catch (error: any) {
    console.error('Admin guest posts fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch guest posts',
      details: error.message
    }, { status: 500 });
  }
}
