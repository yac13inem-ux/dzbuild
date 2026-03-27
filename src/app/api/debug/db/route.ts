import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const { count: userCount, error: countError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('email', 'yac13inem@gmail.com')
      .single();

    return NextResponse.json({
      status: countError ? 'error' : 'connected',
      userCount: userCount || 0,
      adminExists: !!adminUser && !adminError,
      adminUser: adminError ? null : adminUser,
      database: process.env.DATABASE_URL ? 'configured' : 'missing',
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      database: process.env.DATABASE_URL ? 'configured' : 'missing',
    }, { status: 500 });
  }
}
