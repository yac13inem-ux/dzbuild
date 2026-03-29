import { NextRequest, NextResponse } from 'next/server';

// Simple callback handler - redirects to home
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle errors
  if (error) {
    console.error('Auth error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/?auth_error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  // Redirect to home
  return NextResponse.redirect(requestUrl.origin);
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
