import { NextRequest, NextResponse } from 'next/server';

// Initiate Google OAuth flow - returns URL for client redirect
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Google OAuth is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { role = 'NORMAL_USER', redirectTo } = body;

    // Build the Google OAuth URL for Supabase
    const callbackUrl = `${process.env.NEXTAUTH_URL || redirectTo || 'http://localhost:3000'}/api/auth/callback/google`;
    
    // Create state with role info
    const state = Buffer.from(JSON.stringify({ role, redirectTo: callbackUrl })).toString('base64');
    
    // Build Supabase OAuth URL
    const authUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
    authUrl.searchParams.set('provider', 'google');
    authUrl.searchParams.set('redirect_to', callbackUrl);
    authUrl.searchParams.set('state', state);

    return NextResponse.json({ 
      url: authUrl.toString(),
      message: 'Redirect to Google OAuth'
    });
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
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
