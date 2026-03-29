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
    const { name, email, password, role = 'NORMAL_USER', phone, wilaya, city } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: 'الاسم يجب أن يكون حرفين على الأقل' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل مسبقاً' },
        { status: 400 }
      );
    }

    const userRole = role || 'NORMAL_USER';

    // Create user with plain password (for demo - in production use proper hashing)
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        email: normalizedEmail,
        name: name.trim(),
        password: password, // Store plain password for demo
        role: userRole,
        phone: phone?.trim() || null,
        wilaya: wilaya?.trim() || null,
        city: city?.trim() || null,
        is_verified: false,
        is_active: true,
        rating: 0,
        review_count: 0,
        project_count: 0,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create user error:', createError);
      return NextResponse.json(
        { error: 'فشل إنشاء الحساب' },
        { status: 500 }
      );
    }

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.is_verified,
      },
    });

    // Set auth cookie
    response.cookies.set('dzbuild_user_id', user.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'فشل إنشاء الحساب' },
      { status: 500 }
    );
  }
}
