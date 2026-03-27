import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch active ads for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const wilaya = searchParams.get('wilaya');
    const audience = searchParams.get('audience');

    const now = new Date().toISOString();

    let query = supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('priority', { ascending: false })
      .limit(10);

    if (position) {
      query = query.eq('position', position);
    }

    if (wilaya) {
      query = query.or(`wilaya.is.null,wilaya.eq.${wilaya},wilaya.eq.all`);
    }

    if (audience) {
      query = query.or(`target_audience.eq.all,target_audience.eq.${audience}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ads:', error);
      return NextResponse.json({ ads: [] });
    }

    // Transform to frontend interface
    const ads = (data || []).map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      image_url: ad.image_url,
      link_url: ad.link_url,
      position: ad.position,
      ad_type: ad.type,
      duration_days: ad.duration_days,
      start_date: ad.start_date,
      end_date: ad.end_date,
      is_active: ad.is_active,
      clicks_count: ad.clicks_count || 0,
      views_count: ad.views_count || 0,
      target_audience: ad.target_audience,
      wilaya: ad.wilaya,
      priority: ad.priority,
      created_at: ad.created_at,
    }));

    return NextResponse.json({ ads });
  } catch (error) {
    console.error('Public ads API error:', error);
    return NextResponse.json({ ads: [] });
  }
}
