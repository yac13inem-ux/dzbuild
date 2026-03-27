import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Fetch all questions for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const { data, error } = await supabase
      .from('guest_posts')
      .select('*')
      .eq('section', 'EngineeringQuestions')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json({ questions: [] });
    }

    const questions = (data || []).map(q => ({
      id: q.id,
      title: q.title || q.content?.slice(0, 100),
      content: q.content,
      category: q.category || 'concrete',
      author_name: q.name || 'زائر',
      answers_count: q.comment_count || 0,
      votes_count: q.like_count || 0,
      views_count: q.view_count || 0,
      is_pinned: q.status === 'pinned',
      created_at: q.created_at,
    }));

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Fetch questions error:', error);
    return NextResponse.json({ questions: [] });
  }
}
