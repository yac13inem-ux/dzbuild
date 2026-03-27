import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Get user settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ settings: null });
    }

    // Try to get settings from database
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          phone: true,
          city: true,
          bio: true,
          specialization: true,
        },
      });

      if (!user) {
        return NextResponse.json({ settings: null });
      }

      // Get notification and privacy settings from Setting table
      const settings = await db.setting.findMany({
        where: {
          key: { startsWith: `user_${userId}_` },
        },
      });

      const settingsMap: Record<string, string> = {};
      settings.forEach(s => {
        settingsMap[s.key.replace(`user_${userId}_`, '')] = s.value;
      });

      return NextResponse.json({
        settings: {
          profile: user,
          notifications: {
            email: settingsMap['notif_email'] !== 'false',
            push: settingsMap['notif_push'] !== 'false',
            messages: settingsMap['notif_messages'] !== 'false',
            comments: settingsMap['notif_comments'] !== 'false',
            likes: settingsMap['notif_likes'] !== 'false',
            replies: settingsMap['notif_replies'] !== 'false',
            mentions: settingsMap['notif_mentions'] !== 'false',
            followers: settingsMap['notif_followers'] !== 'false',
          },
          privacy: {
            showProfile: settingsMap['privacy_showProfile'] !== 'false',
            showActivity: settingsMap['privacy_showActivity'] !== 'false',
            allowMessages: settingsMap['privacy_allowMessages'] !== 'false',
            showEmail: settingsMap['privacy_showEmail'] === 'true',
            showPhone: settingsMap['privacy_showPhone'] === 'true',
          },
        },
      });
    } catch (dbError) {
      console.log('Database not available');
      return NextResponse.json({ settings: null });
    }
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ settings: null });
  }
}

// Save user settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profile, notifications, privacy } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Update profile
      if (profile) {
        await db.user.update({
          where: { id: userId },
          data: {
            name: profile.name,
            phone: profile.phone,
            city: profile.city,
            bio: profile.bio,
            specialization: profile.specialization,
          },
        });
      }

      // Save notification settings
      if (notifications) {
        for (const [key, value] of Object.entries(notifications)) {
          await db.setting.upsert({
            where: { key: `user_${userId}_notif_${key}` },
            create: {
              key: `user_${userId}_notif_${key}`,
              value: String(value),
            },
            update: {
              value: String(value),
            },
          });
        }
      }

      // Save privacy settings
      if (privacy) {
        for (const [key, value] of Object.entries(privacy)) {
          await db.setting.upsert({
            where: { key: `user_${userId}_privacy_${key}` },
            create: {
              key: `user_${userId}_privacy_${key}`,
              value: String(value),
            },
            update: {
              value: String(value),
            },
          });
        }
      }

      return NextResponse.json({ success: true });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
