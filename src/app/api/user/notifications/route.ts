import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Get user notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    try {
      const notifications = await db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return NextResponse.json({
        notifications: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          content: n.content,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
          data: n.data ? JSON.parse(n.data) : null,
        })),
      });
    } catch (dbError) {
      console.log('Database not available');
      return NextResponse.json({ notifications: [] });
    }
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ notifications: [] });
  }
}

// Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, markAllRead } = body;
    
    try {
      if (markAllRead && userId) {
        await db.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        });
        return NextResponse.json({ success: true });
      }

      if (notificationId) {
        await db.notification.update({
          where: { id: notificationId },
          data: { isRead: true },
        });
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
  } catch (error) {
    console.error('Mark read error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    
    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notification ID' }, { status: 400 });
    }

    try {
      await db.notification.delete({
        where: { id: notificationId },
      });
      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
