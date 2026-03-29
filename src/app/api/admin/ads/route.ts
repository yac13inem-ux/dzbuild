import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch all ads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const activeOnly = searchParams.get('active');

    let query = supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (position) {
      query = query.eq('position', position);
    }

    if (activeOnly === 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ads:', error);
      return NextResponse.json({ ads: [] });
    }

    // Transform to match frontend interface
    const ads = (data || []).map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description || ad.content,
      image_url: ad.image_url,
      link_url: ad.link_url,
      position: ad.position || 'sidebar',
      ad_type: ad.type || 'image',
      duration_days: ad.duration_days || 30,
      start_date: ad.start_date,
      end_date: ad.end_date,
      is_active: ad.is_active ?? (ad.status === 'active'),
      clicks_count: ad.clicks_count || 0,
      views_count: ad.views_count || 0,
      target_audience: ad.target_audience || 'all',
      wilaya: ad.wilaya,
      priority: ad.priority || 0,
      created_at: ad.created_at,
    }));

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Admin ads API error:', error);
    return NextResponse.json({ ads: [] });
  }
}

// POST - Create new ad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      image_url,
      link_url,
      position,
      ad_type,
      duration_days,
      start_date,
      target_audience,
      wilaya,
      priority,
    } = body;

    // Calculate end date based on duration
    const startDate = start_date ? new Date(start_date) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (duration_days || 30));

    const { data, error } = await supabase
      .from('advertisements')
      .insert({
        title,
        description,
        image_url,
        link_url,
        position: position || 'sidebar',
        type: ad_type || 'image',
        duration_days: duration_days || 30,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        target_audience: target_audience || 'all',
        wilaya,
        priority: priority || 0,
        is_active: true,
        clicks_count: 0,
        views_count: 0,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Create ad error:', error);
      return NextResponse.json({ 
        error: 'Failed to create ad: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, ad: data });
  } catch (error) {
    console.error('Create ad error:', error);
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
  }
}

// PUT - Update ad
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ad ID required' }, { status: 400 });
    }

    // Map frontend fields to database fields
    const dbUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.image_url !== undefined) dbUpdates.image_url = updates.image_url;
    if (updates.link_url !== undefined) dbUpdates.link_url = updates.link_url;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.ad_type !== undefined) dbUpdates.type = updates.ad_type;
    if (updates.duration_days !== undefined) dbUpdates.duration_days = updates.duration_days;
    if (updates.start_date !== undefined) dbUpdates.start_date = updates.start_date;
    if (updates.target_audience !== undefined) dbUpdates.target_audience = updates.target_audience;
    if (updates.wilaya !== undefined) dbUpdates.wilaya = updates.wilaya;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.is_active !== undefined) {
      dbUpdates.is_active = updates.is_active;
      dbUpdates.status = updates.is_active ? 'active' : 'paused';
    }

    const { data, error } = await supabase
      .from('advertisements')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update ad error:', error);
      return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
    }

    return NextResponse.json({ success: true, ad: data });
  } catch (error) {
    console.error('Update ad error:', error);
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 });
  }
}

// DELETE - Delete ad
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ad ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('advertisements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete ad error:', error);
      return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete ad error:', error);
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 });
  }
}
