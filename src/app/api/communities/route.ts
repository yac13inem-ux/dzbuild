import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch communities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // Return default communities for now (no communities table in schema)
    return NextResponse.json({ communities: getDefaultCommunities() });
  } catch (error) {
    console.error('Communities fetch error:', error);
    return NextResponse.json({ communities: getDefaultCommunities() });
  }
}

// POST - Join a community
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { community_id, user_id, action } = body;

    if (!community_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing community_id or user_id' },
        { status: 400 }
      );
    }

    // For now, just return success (no communities table in schema)
    return NextResponse.json({ success: true, joined: action !== 'leave' });
  } catch (error) {
    console.error('Community action error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

function getDefaultCommunities() {
  return [
    {
      id: 'engineering',
      name: 'Engineering',
      name_ar: 'الهندسة المدنية',
      name_fr: 'Génie Civil',
      icon: 'building',
      color: '#3B82F6',
      description: 'General civil engineering discussions',
      member_count: 0,
      post_count: 0,
    },
    {
      id: 'concrete',
      name: 'Concrete',
      name_ar: 'الخرسانة',
      name_fr: 'Béton',
      icon: 'box',
      color: '#6366F1',
      description: 'Concrete mix design, pouring, and testing',
      member_count: 0,
      post_count: 0,
    },
    {
      id: 'steel',
      name: 'Steel',
      name_ar: 'حديد التسليح',
      name_fr: 'Armature',
      icon: 'grid-3x3',
      color: '#8B5CF6',
      description: 'Steel reinforcement and structural steel',
      member_count: 0,
      post_count: 0,
    },
    {
      id: 'site-problems',
      name: 'Site Problems',
      name_ar: 'مشاكل الموقع',
      name_fr: 'Problèmes de chantier',
      icon: 'alert-triangle',
      color: '#EF4444',
      description: 'Site issues and solutions',
      member_count: 0,
      post_count: 0,
    },
    {
      id: 'jobs',
      name: 'Jobs',
      name_ar: 'الوظائف',
      name_fr: 'Emplois',
      icon: 'briefcase',
      color: '#F59E0B',
      description: 'Job opportunities in construction',
      member_count: 0,
      post_count: 0,
    },
    {
      id: 'materials',
      name: 'Materials',
      name_ar: 'المواد',
      name_fr: 'Matériaux',
      icon: 'package',
      color: '#10B981',
      description: 'Building materials discussion',
      member_count: 0,
      post_count: 0,
    },
    {
      id: 'tools',
      name: 'Tools & Equipment',
      name_ar: 'الأدوات والمعدات',
      name_fr: 'Outils et équipements',
      icon: 'wrench',
      color: '#6366F1',
      description: 'Tools and equipment for construction',
      member_count: 0,
      post_count: 0,
    },
  ];
}
