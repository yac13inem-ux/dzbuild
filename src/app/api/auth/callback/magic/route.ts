import { NextRequest, NextResponse } from 'next/server';

// Magic link callback - simplified
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  return NextResponse.redirect(requestUrl.origin);
}
