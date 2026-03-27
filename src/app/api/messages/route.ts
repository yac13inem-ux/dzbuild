import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationWith = searchParams.get('conversationWith');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // If conversationWith is provided, get messages between users
    if (conversationWith) {
      const messages = await db.message.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: conversationWith },
            { senderId: conversationWith, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: 100,
        include: {
          sender: { select: { id: true, name: true, avatar: true, role: true } },
          receiver: { select: { id: true, name: true, avatar: true, role: true } },
        },
      });

      // Mark messages as read
      await db.message.updateMany({
        where: {
          receiverId: userId,
          senderId: conversationWith,
          isRead: false,
        },
        data: { isRead: true, readAt: new Date() },
      });

      return NextResponse.json({ messages });
    }

    // Get all conversations
    const sentMessages = await db.message.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
        receiver: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    const receivedMessages = await db.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true, role: true } },
        receiver: { select: { id: true, name: true, avatar: true, role: true } },
      },
    });

    // Combine and deduplicate conversations
    const conversationsMap = new Map<string, any>();

    const allMessages = [...sentMessages, ...receivedMessages];

    for (const msg of allMessages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      if (msg.receiverId === userId && !msg.isRead) {
        const conv = conversationsMap.get(otherUserId);
        conv.unreadCount++;
      }
    }

    // Get unread count
    const unreadCount = await db.message.count({
      where: { receiverId: userId, isRead: false },
    });

    return NextResponse.json({
      conversations: Array.from(conversationsMap.values()),
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ conversations: [], unreadCount: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, content, attachments } = body;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        senderId,
        receiverId,
        content,
        attachments: attachments ? JSON.stringify(attachments) : null,
        isRead: false,
      },
    });

    // Create notification for receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        type: 'message',
        title: 'رسالة جديدة',
        content: content.substring(0, 100),
        data: JSON.stringify({ senderId, messageId: message.id }),
        isRead: false,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
