import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch all projects (for frontend)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    // Only filter by is_active if the column exists
    // Don't filter by is_published as it might not exist

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: projects, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ projects: [] });
    }

    // Transform data for frontend compatibility
    const formattedProjects = (projects || []).map(p => ({
      id: p.id,
      title: p.title,
      titleAr: p.title_ar,
      titleFr: p.title_fr,
      description: p.description,
      descriptionAr: p.description_ar,
      descriptionFr: p.description_fr,
      status: p.status || 'planning',
      category: p.category || 'residential', // Default to residential if not set
      progress: p.progress || 0,
      location: p.location,
      city: p.city,
      wilaya: p.wilaya,
      budget: p.budget,
      startDate: p.start_date,
      endDate: p.end_date,
      images: p.images,
      createdAt: p.created_at,
    }));

    console.log('Fetched projects:', formattedProjects.length);

    return NextResponse.json({ projects: formattedProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ projects: [], error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST - Create a new project (for frontend)
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title: data.title,
        title_ar: data.titleAr || data.title_ar,
        title_fr: data.titleFr || data.title_fr,
        description: data.description,
        description_ar: data.descriptionAr || data.description_ar,
        description_fr: data.descriptionFr || data.description_fr,
        status: data.status || 'planning',
        category: data.category || 'other',
        progress: data.progress || 0,
        location: data.location,
        city: data.city || data.location,
        wilaya: data.wilaya || data.location,
        budget: data.budget ? parseFloat(data.budget) : null,
        start_date: data.startDate || data.start_date ? new Date(data.startDate || data.start_date).toISOString() : null,
        end_date: data.endDate || data.end_date ? new Date(data.endDate || data.end_date).toISOString() : null,
        images: data.images || data.image,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Create project error:', error);
      return NextResponse.json({ error: 'Failed to create project: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      project: {
        id: project.id,
        title: project.title,
        titleAr: project.title_ar,
        titleFr: project.title_fr,
        description: project.description,
        descriptionAr: project.description_ar,
        descriptionFr: project.description_fr,
        status: project.status,
        category: project.category,
        progress: project.progress,
        location: project.location,
        city: project.city,
        wilaya: project.wilaya,
        budget: project.budget,
        startDate: project.start_date,
        endDate: project.end_date,
        images: project.images,
        createdAt: project.created_at,
      }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
