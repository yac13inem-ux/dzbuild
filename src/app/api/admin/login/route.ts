import { NextRequest, NextResponse } from 'next/server';

// Admin credentials
const ADMIN_EMAIL = 'yac13inem@gmail.com';
const ADMIN_PASSWORD = 'Amina022000l';

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check credentials
    if (normalizedEmail !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 401 });
    }

    // Create admin user
    const adminUser = {
      id: 'admin-001',
      name: 'Admin',
      email: ADMIN_EMAIL,
      role: 'ADMIN',
      avatar: null,
    };

    const response = NextResponse.json({
      success: true,
      user: adminUser
    });

    // Set cookies for session
    response.cookies.set('user-id', adminUser.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set('user-role', 'ADMIN', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'فشل تسجيل الدخول' }, { status: 500 });
  }
}
