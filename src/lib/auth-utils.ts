import { cookies, headers } from 'next/headers';
import { db } from './db';

// Get current user from session cookie or x-user-id header
export async function getAuthUser() {
  try {
    // First try session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dzbuild_session');

    if (sessionCookie?.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        const user = await db.user.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
            phone: true,
            isVerified: true,
            rating: true,
            reviewCount: true,
            city: true,
            wilaya: true,
            specialization: true,
            bio: true,
            isActive: true,
          },
        });
        
        if (user && user.isActive) {
          console.log('[Auth] User from session:', user.email);
          return user;
        }
      } catch (e) {
        console.log('[Auth] Session parse error:', e);
      }
    }

    // Fallback: try x-user-id header
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    
    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          phone: true,
          isVerified: true,
          rating: true,
          reviewCount: true,
          city: true,
          wilaya: true,
          specialization: true,
          bio: true,
          isActive: true,
        },
      });
      
      if (user && user.isActive) {
        console.log('[Auth] User from header:', user.email);
        return user;
      }
    }

    console.log('[Auth] No user found');
    return null;
  } catch (error) {
    console.error('[Auth] Error getting user:', error);
    return null;
  }
}
