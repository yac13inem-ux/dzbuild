import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Get single craftsman
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: craftsman, error } = await supabase
      .from('craftsmen')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Craftsman not found' }, { status: 404 });
    }

    return NextResponse.json({ craftsman });
  } catch (error) {
    console.error('Get craftsman error:', error);
    return NextResponse.json({ error: 'Failed to get craftsman' }, { status: 500 });
  }
}

// PUT - Update craftsman
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      name,
      category,
      specialty,
      city,
      wilaya,
      phone,
      email,
      experience,
      experience_years,
      description,
      bio,
      images,
      hourly_rate,
      daily_rate,
      is_available,
    } = body;

    const { data: craftsman, error } = await supabase
      .from('craftsmen')
      .update({
        name,
        category,
        specialty: specialty || specialty,
        city,
        wilaya,
        phone,
        email,
        experience: experience || experience_years || 0,
        description: description || bio,
        image_url: images && images[0],
        hourly_rate,
        daily_rate,
        is_available: is_available !== false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to update craftsman: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, craftsman });
  } catch (error) {
    console.error('Update craftsman error:', error);
    return NextResponse.json({ error: 'Failed to update craftsman' }, { status: 500 });
  }
}

// DELETE - Delete craftsman
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { error } = await supabase
      .from('craftsmen')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to delete craftsman: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete craftsman error:', error);
    return NextResponse.json({ error: 'Failed to delete craftsman' }, { status: 500 });
  }
}
