import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get posts count
    const postsCount = await db.post.count({
      where: { authorId: userId },
    });

    // Get comments count
    const commentsCount = await db.comment.count({
      where: { authorId: userId },
    });

    // Get recent activity
    const recentPosts = await db.post.findMany({
      where: { authorId: userId },
      select: { id: true, title: true, content: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Calculate simple reputation
    const reputation = postsCount * 5 + commentsCount * 2;

    return NextResponse.json({
      stats: {
        postsCount,
        commentsCount,
        upvotesReceived: 0,
        downvotesReceived: 0,
        votesGiven: 0,
        reputation: Math.max(0, reputation),
      },
      recentActivity: {
        posts: recentPosts,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({
      stats: {
        postsCount: 0,
        commentsCount: 0,
        upvotesReceived: 0,
        downvotesReceived: 0,
        votesGiven: 0,
        reputation: 0,
      },
      recentActivity: { posts: [] }
    });
  }
}
