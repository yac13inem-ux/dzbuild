import { NextRequest, NextResponse } from 'next/server';

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Magic Link is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, role = 'NORMAL_USER', name, redirectUrl } = body;

    console.log('Magic link request:', { email, role, name, redirectUrl });

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // Use redirectUrl from client
    let baseUrl: string = redirectUrl;
    
    if (!baseUrl) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      
      if (forwardedHost) {
        baseUrl = `${forwardedProto}://${forwardedHost}`;
      } else if (origin) {
        baseUrl = origin;
      } else if (host) {
        baseUrl = `https://${host}`;
      } else {
        baseUrl = new URL(request.url).origin;
      }
    }
    
    console.log('Magic link - Using base URL:', baseUrl);

    // Send magic link via Supabase
    const response = await fetch(`${supabaseUrl}/auth/v1/magiclink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        options: {
          data: {
            role,
            name: name || email.split('@')[0],
          },
          emailRedirectTo: `${baseUrl}/api/auth/callback/magic`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Magic link error:', data);
      return NextResponse.json(
        { error: data.message || 'فشل إرسال الرابط' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رابط التسجيل إلى بريدك الإلكتروني',
    });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json({ error: 'فشل إرسال الرابط' }, { status: 500 });
  }
}
