import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Toggle follow (simplified)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { follower_id, following_id } = body;

    if (!follower_id || !following_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (follower_id === following_id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // For now, just return success
    return NextResponse.json({ following: true, message: 'Following' });
  } catch (error) {
    console.error('Follow toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 });
  }
}

// GET - Get followers/following
export async function GET(request: NextRequest) {
  try {
    // For now, return empty
    return NextResponse.json({ users: [] });
  } catch (error) {
    console.error('Follow fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
