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

// PUT - Update craftsman (requires edit_token for guest posts)
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
      city,
      wilaya,
      phone,
      email,
      experience,
      experience_years,
      description,
      bio,
      image_url,
      hourly_rate,
      daily_rate,
      is_available,
      edit_token,
    } = body;

    // Verify edit_token for guest posts
    const { data: existingCraftsman, error: fetchError } = await supabase
      .from('craftsmen')
      .select('id, edit_token')
      .eq('id', id)
      .single();

    if (fetchError || !existingCraftsman) {
      return NextResponse.json({ error: 'Craftsman not found' }, { status: 404 });
    }

    // Check edit_token if craftsman has one
    if (existingCraftsman.edit_token && existingCraftsman.edit_token !== edit_token) {
      return NextResponse.json({ 
        error: 'Invalid edit token. You do not have permission to edit this craftsman.' 
      }, { status: 403 });
    }

    const { data: craftsman, error } = await supabase
      .from('craftsmen')
      .update({
        name,
        category,
        city,
        wilaya,
        phone,
        email,
        experience: experience || experience_years || 0,
        description: description || bio,
        image_url: image_url,
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

// DELETE - Delete craftsman (requires edit_token for guest posts)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const edit_token = searchParams.get('edit_token');
    
    // Verify edit_token for guest posts
    const { data: existingCraftsman, error: fetchError } = await supabase
      .from('craftsmen')
      .select('id, edit_token')
      .eq('id', id)
      .single();

    if (fetchError || !existingCraftsman) {
      return NextResponse.json({ error: 'Craftsman not found' }, { status: 404 });
    }

    // Check edit_token if craftsman has one
    if (existingCraftsman.edit_token && existingCraftsman.edit_token !== edit_token) {
      return NextResponse.json({ 
        error: 'Invalid edit token. You do not have permission to delete this craftsman.' 
      }, { status: 403 });
    }
    
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
