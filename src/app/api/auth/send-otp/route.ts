import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Send OTP code to email (6-digit code)
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'OTP authentication is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { email, role } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    console.log('Sending OTP to:', emailLower);

    // Send 6-digit OTP code
    const { error } = await supabase.auth.signInWithOtp({
      email: emailLower,
      options: {
        shouldCreateUser: true,
        data: {
          role: role || 'NORMAL_USER',
        },
      },
    });

    if (error) {
      console.error('OTP send error:', error);
      
      if (error.message.includes('rate limit') || error.message.includes('SMS')) {
        return NextResponse.json({ 
          error: 'تم إرسال رمز التحقق مسبقاً. تحقق من بريدك أو انتظر دقيقة.',
          errorEn: 'A verification code was already sent. Check your email or wait a minute.'
        }, { status: 429 });
      }
      
      if (error.message.includes('Signups not allowed')) {
        return NextResponse.json({ 
          error: 'التسجيل غير مسموح حالياً',
          errorEn: 'Signups are not allowed at this time'
        }, { status: 400 });
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رمز التحقق (6 أرقام) إلى بريدك الإلكتروني',
      messageEn: 'A 6-digit verification code has been sent to your email',
      email: emailLower,
    });
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

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
