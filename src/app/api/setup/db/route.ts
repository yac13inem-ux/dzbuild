import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const { error: testError } = await supabase.from('users').select('id').limit(1);

    // Check if users table exists and count
    let usersCount = 0;
    const { count, error } = await supabase.from('users').select('id', { count: 'exact', head: true });
    if (!error) {
      usersCount = count || 0;
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      testResult: testError ? testError.message : 'Connected',
      usersCount,
    });
  } catch (error: any) {
    console.error('Database check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString(),
    }, { status: 500 });
  }
}
