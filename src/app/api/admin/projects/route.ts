import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch all projects
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ projects: [] });
    }
    
    // Transform data to match frontend interface
    const projects = (data || []).map(p => ({
      id: p.id,
      title: p.title,
      titleAr: p.title_ar,
      titleFr: p.title_fr,
      description: p.description,
      descriptionAr: p.description_ar,
      descriptionFr: p.description_fr,
      status: p.status || 'planning',
      category: p.category || 'residential',
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
    
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ projects: [] }, { status: 500 });
  }
}

// POST - Create new project
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Creating project with data:', data);
    
    // Generate a unique ID
    const id = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        id,
        title: data.title || '',
        title_ar: data.titleAr || null,
        title_fr: data.titleFr || null,
        description: data.description || null,
        description_ar: data.descriptionAr || null,
        description_fr: data.descriptionFr || null,
        status: data.status || 'planning',
        category: data.category || 'residential',
        progress: data.progress || 0,
        location: data.location || null,
        city: data.location || null,
        wilaya: data.location || null,
        budget: data.budget || null,
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        images: data.image || null,
        is_active: true,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ 
        error: 'Failed to create project: ' + error.message 
      }, { status: 500 });
    }
    
    // Transform response
    const response = {
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
    };
    
    console.log('Created project:', response);
    
    return NextResponse.json({ project: response });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ 
      error: 'Failed to create project: ' + (error as Error).message 
    }, { status: 500 });
  }
}
