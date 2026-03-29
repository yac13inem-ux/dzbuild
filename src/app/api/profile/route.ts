import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('id, name, email, avatar, role, bio, city, wilaya, specialization, experience, license_number, rating, review_count, project_count, is_verified, created_at')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT - Update profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    // Remove fields that shouldn't be updated directly
    delete updates.email;
    delete updates.role;
    delete updates.rating;
    delete updates.review_count;
    delete updates.project_count;
    delete updates.created_at;

    // Map to snake_case for Supabase
    const supabaseUpdates: Record<string, unknown> = {};
    if (updates.name) supabaseUpdates.name = updates.name;
    if (updates.avatar !== undefined) supabaseUpdates.avatar = updates.avatar;
    if (updates.bio !== undefined) supabaseUpdates.bio = updates.bio;
    if (updates.city !== undefined) supabaseUpdates.city = updates.city;
    if (updates.wilaya !== undefined) supabaseUpdates.wilaya = updates.wilaya;
    if (updates.specialization !== undefined) supabaseUpdates.specialization = updates.specialization;
    if (updates.experience !== undefined) supabaseUpdates.experience = updates.experience;
    if (updates.license_number !== undefined) supabaseUpdates.license_number = updates.license_number;
    if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
    if (updates.address !== undefined) supabaseUpdates.address = updates.address;
    if (updates.website !== undefined) supabaseUpdates.website = updates.website;

    const { data: profile, error } = await supabase
      .from('users')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
