import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/**
 * Setup Edit Token Columns
 * This API checks if edit_token columns exist and provides SQL to create them
 * GET /api/setup/edit-token-columns
 */
export async function GET() {
  try {
    const results: { table: string; hasEditToken: boolean; error?: string }[] = [];
    
    const tables = ['products', 'craftsmen', 'companies', 'jobs', 'projects', 'comments'];
    
    for (const table of tables) {
      try {
        // Try to select edit_token column
        const { error } = await supabase
          .from(table)
          .select('edit_token')
          .limit(1);
        
        const hasEditToken = !error || !error.message?.includes('column') && !error.message?.includes('does not exist');
        
        results.push({
          table,
          hasEditToken,
          error: error?.message
        });
      } catch (e) {
        results.push({
          table,
          hasEditToken: false,
          error: (e as Error).message
        });
      }
    }
    
    // Generate SQL commands for missing columns
    const sqlCommands = results
      .filter(r => !r.hasEditToken)
      .map(r => `ALTER TABLE ${r.table} ADD COLUMN IF NOT EXISTS edit_token TEXT;`)
      .join('\n');
    
    return NextResponse.json({
      success: true,
      results,
      allHaveEditToken: results.every(r => r.hasEditToken),
      sqlCommands: sqlCommands || 'All tables have edit_token column',
      instructions: results.some(r => !r.hasEditToken) 
        ? 'Run the SQL commands in Supabase SQL Editor to add missing columns'
        : 'All tables are properly configured'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
