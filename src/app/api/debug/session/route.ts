import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    // Check for auth cookies (support both naming conventions)
    const userId = cookieStore.get('dzbuild_user_id')?.value || 
                   cookieStore.get('user-id')?.value;
    const userRole = cookieStore.get('user-role')?.value;
    
    // List all cookies for debugging
    const allCookies = cookieStore.getAll().map(c => c.name);

    if (!userId) {
      return NextResponse.json({
        hasSession: false,
        sessionValue: 'none',
        sessionData: null,
        user: null,
        allCookies,
      });
    }

    // Admin check
    const ADMIN_ID = 'admin-001';
    const ADMIN_EMAIL = 'yac13inem@gmail.com';
    
    if (userId === ADMIN_ID) {
      return NextResponse.json({
        hasSession: true,
        sessionValue: 'present',
        sessionData: { userId, role: userRole },
        user: {
          id: ADMIN_ID,
          name: 'Admin',
          email: ADMIN_EMAIL,
          role: userRole || 'ADMIN',
        },
        allCookies,
      });
    }

    // For other users
    return NextResponse.json({
      hasSession: true,
      sessionValue: 'present',
      sessionData: { userId, role: userRole },
      user: null, // Would need database lookup
      allCookies,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
