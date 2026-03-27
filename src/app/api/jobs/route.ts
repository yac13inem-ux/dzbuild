import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Job categories with Arabic and French names
export const JOB_CATEGORIES = [
  {
    id: 'engineers',
    nameAr: '👷 وظائف مهندسين',
    nameFr: '👷 Emplois Ingénieurs',
    shortNameAr: 'مهندسين',
    shortNameFr: 'Ingénieurs',
    icon: '👷',
    color: 'bg-blue-500'
  },
  {
    id: 'technicians',
    nameAr: '👷‍♂️ وظائف تقنيين',
    nameFr: '👷‍♂️ Emplois Techniciens',
    shortNameAr: 'تقنيين',
    shortNameFr: 'Techniciens',
    icon: '👷‍♂️',
    color: 'bg-teal-500'
  },
  {
    id: 'workers',
    nameAr: '🧱 وظائف عمال',
    nameFr: '🧱 Emplois Ouvriers',
    shortNameAr: 'عمال',
    shortNameFr: 'Ouvriers',
    icon: '🧱',
    color: 'bg-orange-500'
  },
  {
    id: 'internships',
    nameAr: '🏗 تدريب للطلبة',
    nameFr: '🏗 Stages Étudiants',
    shortNameAr: 'تدريب',
    shortNameFr: 'Stages',
    icon: '🏗',
    color: 'bg-purple-500'
  },
];

// Wilayas of Algeria
export const WILAYAS = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
  'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
  'عين الدفلى', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
  'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
  'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي', 'خنشلة',
  'سوق أهراس', 'ميلة', 'النعامة', 'عين تموشنت', 'غرداية', 'غليزان'
];

// Experience levels
export const EXPERIENCE_LEVELS = [
  { id: 'entry', nameAr: 'مبتدئ (0-1 سنة)', nameFr: 'Débutant (0-1 an)' },
  { id: 'junior', nameAr: 'مبتدئ (1-3 سنوات)', nameFr: 'Junior (1-3 ans)' },
  { id: 'mid', nameAr: 'متوسط (3-5 سنوات)', nameFr: 'Intermédiaire (3-5 ans)' },
  { id: 'senior', nameAr: 'خبير (5+ سنوات)', nameFr: 'Senior (5+ ans)' },
  { id: 'any', nameAr: 'غير محدد', nameFr: 'Non spécifié' },
];

// GET - Public API for jobs (no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const wilaya = searchParams.get('wilaya');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (wilaya) {
      query = query.eq('wilaya', wilaya);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({
        jobs: [],
        categories: JOB_CATEGORIES,
        wilayas: WILAYAS,
        experienceLevels: EXPERIENCE_LEVELS,
        total: 0
      });
    }

    // Filter by search if provided
    let jobs = data || [];
    if (search) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.company_name?.toLowerCase().includes(searchLower)
      );
    }

    // Transform data to match frontend interface
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category,
      company_name: job.company_name,
      company_logo: job.company_logo,
      wilaya: job.wilaya,
      city: job.city,
      experience_level: job.experience_level,
      salary_range: job.salary_range,
      job_type: job.job_type,
      contact_email: job.contact_email,
      contact_phone: job.contact_phone,
      deadline: job.deadline,
      status: job.status || 'active',
      is_featured: job.is_featured || false,
      views_count: job.views_count || 0,
      created_at: job.created_at,
    }));

    return NextResponse.json({
      jobs: transformedJobs,
      categories: JOB_CATEGORIES,
      wilayas: WILAYAS,
      experienceLevels: EXPERIENCE_LEVELS,
      total: transformedJobs.length
    });
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json({
      jobs: [],
      categories: JOB_CATEGORIES,
      wilayas: WILAYAS,
      experienceLevels: EXPERIENCE_LEVELS,
      total: 0
    });
  }
}

// POST - Create new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      company_name,
      company_logo,
      wilaya,
      city,
      experience_level,
      salary_range,
      job_type,
      contact_email,
      contact_phone,
      deadline,
      is_featured,
    } = body;

    if (!title || !category || !company_name) {
      return NextResponse.json(
        { error: 'Title, category and company name are required' },
        { status: 400 }
      );
    }

    // Generate a unique ID
    const id = `job-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        id,
        title,
        description,
        category,
        company_name,
        company_logo,
        wilaya,
        city,
        experience_level,
        salary_range,
        job_type: job_type || 'full_time',
        contact_email,
        contact_phone,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        is_featured: is_featured || false,
        status: 'active',
        views_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Create job error:', error);
      return NextResponse.json({ 
        error: 'Failed to create job: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
