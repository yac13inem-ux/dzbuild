import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check user-id cookie
    const userId = request.cookies.get('user-id')?.value;

    // Check x-user-id header
    const headerUserId = request.headers.get('x-user-id');

    // Check all cookies
    const cookieHeader = request.headers.get('cookie');

    let user = null;
    if (userId) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', userId)
        .single();

      if (!error && data) {
        user = data;
      }
    }

    return NextResponse.json({
      sessionUser: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      } : null,
      headerUserId,
      hasCookie: !!cookieHeader,
      cookieLength: cookieHeader?.length || 0,
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testAuth } = body;

    if (testAuth) {
      // Test auth with header
      const headerUserId = request.headers.get('x-user-id');
      const userId = request.cookies.get('user-id')?.value;

      let user = null;

      if (userId || headerUserId) {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role')
          .eq('id', userId || headerUserId)
          .single();

        if (!error && data) {
          user = data;
        }
      }

      return NextResponse.json({
        success: true,
        authenticated: !!user,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
        } : null,
        headerUserId,
      });
    }

    return NextResponse.json({ success: false, message: 'No test specified' });
  } catch (error: unknown) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
