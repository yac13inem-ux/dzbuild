import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// This route handles OAuth callbacks - simplified version without Supabase
// It redirects to home with an error message since OAuth is disabled
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/?auth_error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // OAuth is disabled - redirect with error
  return NextResponse.redirect(
    `${requestUrl.origin}/?auth_error=${encodeURIComponent('OAuth authentication is disabled. Please use email/password login.')}`
  );
}
