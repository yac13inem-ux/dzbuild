import { NextRequest, NextResponse } from 'next/server';

// Admin credentials
const ADMIN_ID = 'admin-001';
const ADMIN_EMAIL = 'yac13inem@gmail.com';

export async function GET(request: NextRequest) {
  try {
    // Check for cookie names (support both naming conventions)
    const userId = request.cookies.get('dzbuild_user_id')?.value || 
                   request.cookies.get('user-id')?.value;
    const userRole = request.cookies.get('user-role')?.value;

    if (!userId) {
      return NextResponse.json({ user: null });
    }

    // Check if admin
    if (userId === ADMIN_ID) {
      return NextResponse.json({
        user: {
          id: ADMIN_ID,
          name: 'Admin',
          email: ADMIN_EMAIL,
          role: userRole || 'ADMIN',
          avatar: null,
          isVerified: true,
        }
      });
    }

    // For regular users, we would check the database here
    // For now, just return null if not admin
    return NextResponse.json({ user: null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
