import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function OPTIONS() {
  return NextResponse.json(null, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
}

export async function GET() {
  try {
    // Get counts
    const [usersRes, postsRes, questionsRes, companiesRes, craftsmenRes, projectsRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('guest_posts').select('id', { count: 'exact', head: true }).neq('section', 'EngineeringQuestions'),
      supabase.from('guest_posts').select('id', { count: 'exact', head: true }).eq('section', 'EngineeringQuestions'),
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('craftsmen').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
    ]);

    // Get user counts by role
    const { data: users } = await supabase.from('users').select('role');
    const userCounts = {
      total: users?.length || 0,
      CIVIL_ENGINEER: users?.filter(u => u.role === 'CIVIL_ENGINEER').length || 0,
      CONTRACTOR: users?.filter(u => u.role === 'CONTRACTOR').length || 0,
      CRAFTSMAN: users?.filter(u => u.role === 'CRAFTSMAN').length || 0,
      CONSTRUCTION_COMPANY: users?.filter(u => u.role === 'CONSTRUCTION_COMPANY').length || 0,
      ADMIN: users?.filter(u => u.role === 'ADMIN').length || 0,
    };

    return NextResponse.json({
      users: userCounts,
      pendingApprovals: 0,
      ads: { total: 0, active: 0 },
      stats: {
        totalUsers: usersRes.count || 0,
        totalPosts: postsRes.count || 0,
        craftsmenCount: craftsmenRes.count || 0,
        engineersCount: userCounts.CIVIL_ENGINEER,
        companiesCount: companiesRes.count || 0,
        projectsCount: projectsRes.count || 0,
        jobsCount: 0,
      }
    });
  } catch (error) {
    return NextResponse.json({
      users: { total: 0 },
      pendingApprovals: 0,
      ads: { total: 0, active: 0 },
      stats: { totalUsers: 0, totalPosts: 0 }
    });
  }
}
