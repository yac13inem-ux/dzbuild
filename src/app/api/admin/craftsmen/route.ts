import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch all craftsmen profiles for admin
export async function GET() {
  try {
    const { data: craftsmen, error } = await supabase
      .from('craftsmen')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching craftsmen:', error);
      return NextResponse.json({ craftsmen: [] });
    }
    
    return NextResponse.json({ craftsmen: craftsmen || [] });
  } catch (error) {
    console.error('Error fetching craftsmen:', error);
    return NextResponse.json({ craftsmen: [] }, { status: 500 });
  }
}

// POST - Create a new craftsman (admin adds directly)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      category,
      city,
      wilaya,
      experience,
      specializations,
      hourly_rate,
      daily_rate,
      is_available,
      verified,
      description,
      image_url,
    } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json({ 
        error: 'Name and category are required' 
      }, { status: 400 });
    }

    // Generate a unique ID
    const id = `craftsman-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const { data: craftsman, error } = await supabase
      .from('craftsmen')
      .insert({
        id,
        name,
        email: email || null,
        phone: phone || null,
        category,
        city: city || null,
        wilaya: wilaya || null,
        experience: experience ? parseInt(experience) : null,
        specializations: specializations || [],
        hourly_rate: hourly_rate ? parseFloat(hourly_rate) : null,
        daily_rate: daily_rate ? parseFloat(daily_rate) : null,
        is_available: is_available ?? true,
        verified: verified ?? false,
        description: description || null,
        image_url: image_url || null,
        rating: 0,
        review_count: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating craftsman:', error);
      return NextResponse.json({ 
        error: 'Failed to create craftsman: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ craftsman });
  } catch (error) {
    console.error('Error creating craftsman:', error);
    return NextResponse.json({ 
      error: 'Failed to create craftsman: ' + (error as Error).message 
    }, { status: 500 });
  }
}
