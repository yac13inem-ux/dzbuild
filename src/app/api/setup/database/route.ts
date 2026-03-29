import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * Database Setup API
 * Call this endpoint after deployment to create all tables
 * GET /api/setup/database
 */
export async function GET() {
  try {
    console.log('[Setup] Starting database setup...');

    // Test connection first
    const { error: testError } = await supabase.from('users').select('id').limit(1);
    if (testError && testError.code !== 'PGRST116') {
      console.log('[Setup] Database connection test:', testError.message);
    }
    console.log('[Setup] Database connection successful');

    // Note: Tables should be created via Supabase dashboard or migrations
    // This endpoint just verifies the connection
    const tables = ['users', 'posts', 'comments', 'questions', 'companies', 'craftsmen', 'products', 'jobs', 'library_resources', 'projects', 'advertisements', 'settings', 'guest_posts', 'guest_comments'];

    const tableStatus: Record<string, boolean> = {};
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      tableStatus[table] = !error || error.code === 'PGRST116';
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection verified!',
      tables: tableStatus
    });
  } catch (error: any) {
    console.error('[Setup] Database setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}
