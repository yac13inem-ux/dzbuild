import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// DELETE - Delete a craftsman profile
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('DELETE request for craftsman:', id);
    
    const { error } = await supabase
      .from('craftsmen')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting craftsman:', error);
      return NextResponse.json({ 
        error: 'Failed to delete craftsman: ' + error.message 
      }, { status: 500 });
    }
    
    console.log('Deleted craftsman:', id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting craftsman:', error);
    return NextResponse.json({ 
      error: 'Failed to delete craftsman: ' + (error as Error).message 
    }, { status: 500 });
  }
}

// PATCH - Update a craftsman profile
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.wilaya !== undefined) updateData.wilaya = body.wilaya;
    if (body.experience !== undefined) updateData.experience = parseInt(body.experience) || null;
    if (body.specializations !== undefined) updateData.specializations = body.specializations;
    if (body.hourlyRate !== undefined) updateData.hourly_rate = parseFloat(body.hourlyRate) || null;
    if (body.dailyRate !== undefined) updateData.daily_rate = parseFloat(body.dailyRate) || null;
    if (body.isAvailable !== undefined) updateData.is_available = body.isAvailable;
    if (body.verified !== undefined) updateData.verified = body.verified;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;

    const { data: craftsman, error } = await supabase
      .from('craftsmen')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating craftsman:', error);
      return NextResponse.json({ 
        error: 'Failed to update craftsman: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ craftsman });
  } catch (error) {
    console.error('Error updating craftsman:', error);
    return NextResponse.json({ 
      error: 'Failed to update craftsman: ' + (error as Error).message 
    }, { status: 500 });
  }
}

// GET - Get single craftsman profile
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: craftsman, error } = await supabase
      .from('craftsmen')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !craftsman) {
      return NextResponse.json({ 
        error: 'Craftsman not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ craftsman });
  } catch (error) {
    console.error('Error fetching craftsman:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch craftsman' 
    }, { status: 500 });
  }
}
