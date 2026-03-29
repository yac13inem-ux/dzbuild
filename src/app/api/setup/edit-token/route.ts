import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// This endpoint checks if edit_token column exists

export async function GET() {
  try {
    // Try to select edit_token to see if column exists
    const { error: testError } = await supabase
      .from('guest_posts')
      .select('edit_token')
      .limit(1);

    if (testError && testError.message.includes('column')) {
      return NextResponse.json({
        message: 'edit_token column needs to be added manually in Supabase dashboard',
        instruction: 'Run this SQL in Supabase SQL Editor: ALTER TABLE guest_posts ADD COLUMN IF NOT EXISTS edit_token VARCHAR(64) UNIQUE;',
        status: 'action_required'
      });
    }

    return NextResponse.json({
      message: 'edit_token column already exists or table is ready',
      status: 'ready'
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      message: 'Could not verify edit_token column',
      instruction: 'Run this SQL in Supabase SQL Editor: ALTER TABLE guest_posts ADD COLUMN IF NOT EXISTS edit_token VARCHAR(64) UNIQUE;',
      status: 'unknown'
    });
  }
}
