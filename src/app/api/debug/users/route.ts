import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check if users table exists and has data
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      take: 10,
    });

    const count = await db.user.count();

    return NextResponse.json({
      success: true,
      totalUsers: count,
      users: users,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug users error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
