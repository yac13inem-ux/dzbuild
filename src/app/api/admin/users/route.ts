import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function OPTIONS() {
  return NextResponse.json(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
}

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, city, wilaya, is_active, is_verified, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return NextResponse.json({ users: [] });

    const formatted = (users || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      city: u.city,
      wilaya: u.wilaya,
      is_active: u.is_active,
      is_verified: u.is_verified,
      created_at: u.created_at,
    }));

    return NextResponse.json({ users: formatted });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
