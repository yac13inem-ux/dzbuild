import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = 'yac13inem@gmail.com';

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('admin-session');
    const userInfo = request.cookies.get('user-info');

    if (!adminSession || !userInfo) {
      return NextResponse.json({ 
        authenticated: false,
        user: null 
      });
    }

    try {
      const user = JSON.parse(userInfo.value);
      
      // Verify the session is valid
      const decoded = Buffer.from(adminSession.value, 'base64').toString();
      if (!decoded.startsWith(ADMIN_EMAIL)) {
        return NextResponse.json({ 
          authenticated: false,
          user: null 
        });
      }

      return NextResponse.json({
        authenticated: true,
        user: user,
      });
    } catch {
      return NextResponse.json({ 
        authenticated: false,
        user: null 
      });
    }
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ 
      authenticated: false,
      user: null 
    });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  response.cookies.delete('admin-session');
  response.cookies.delete('user-info');
  
  return response;
}
