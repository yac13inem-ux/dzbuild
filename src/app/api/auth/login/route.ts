import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Admin credentials (for admin login)
    const ADMIN_EMAIL = 'yac13inem@gmail.com';
    const ADMIN_PASSWORD = 'Amina022000l';

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if admin login
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      const adminUser = {
        id: 'admin-001',
        name: 'Admin',
        email: ADMIN_EMAIL,
        role: 'ADMIN',
        avatar: null,
        isVerified: true,
      };

      const response = NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: adminUser,
      });

      // Set auth cookies - use consistent settings for Vercel
      const isProduction = process.env.NODE_ENV === 'production';
      
      response.cookies.set('dzbuild_user_id', adminUser.id, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      response.cookies.set('user-role', 'ADMIN', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    // Check regular users in Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('is_active', true)
      .limit(1);

    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Simple password comparison (in production, use proper hashing)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        isVerified: user.is_verified,
        city: user.city,
        wilaya: user.wilaya,
      },
    });

    const isProduction = process.env.NODE_ENV === 'production';

    // Set auth cookie with user ID
    response.cookies.set('dzbuild_user_id', user.id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'فشل تسجيل الدخول' },
      { status: 500 }
    );
  }
}
