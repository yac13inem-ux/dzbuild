import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Verify OTP code (6-digit code from email)
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'OTP authentication is not configured.' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await request.json();
    const { email, token } = body;

    if (!email || !token) {
      return NextResponse.json({ error: 'Email and token are required' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    console.log('Verifying OTP for:', emailLower);

    // Verify the OTP token (6-digit code)
    const { data, error } = await supabase.auth.verifyOtp({
      email: emailLower,
      token,
      type: 'email',
    });

    if (error) {
      console.error('OTP verify error:', error);
      
      if (error.message.includes('expired')) {
        return NextResponse.json({ 
          error: 'انتهت صلاحية الرمز. أعد إرسال رمز جديد.',
          errorEn: 'Code expired. Request a new one.'
        }, { status: 400 });
      }
      
      if (error.message.includes('invalid') || error.message.includes('Invalid')) {
        return NextResponse.json({ 
          error: 'رمز التحقق غير صحيح',
          errorEn: 'Invalid verification code'
        }, { status: 400 });
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    console.log('User verified:', data.user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        email: data.user.email,
        role: data.user.user_metadata?.role || 'NORMAL_USER',
      },
      session: data.session,
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
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
