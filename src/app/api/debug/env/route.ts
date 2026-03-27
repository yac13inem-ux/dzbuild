import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  // Check which database environment variables are available
  const envVars = {
    // Supabase variables
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    DATABASE_URL: !!process.env.DATABASE_URL,
    // Auth variables
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    NODE_ENV: process.env.NODE_ENV,
  };

  // Check if Supabase can connect
  let dbStatus = 'not_tested';
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    dbStatus = error ? error.message : 'connected';
  } catch (error) {
    dbStatus = error instanceof Error ? error.message : 'unknown_error';
  }

  return NextResponse.json({
    success: true,
    environmentVariables: envVars,
    databaseStatus: dbStatus,
    timestamp: new Date().toISOString(),
  });
}
