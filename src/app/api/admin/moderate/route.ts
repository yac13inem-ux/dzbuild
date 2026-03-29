import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Admin email
const ADMIN_EMAIL = 'yac13inem@gmail.com';

// Verify admin access
async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const userId = request.cookies.get('dzbuild_user_id')?.value;
  const userRole = request.cookies.get('user-role')?.value;
  
  // Simple admin check via cookie
  if (userRole === 'ADMIN') {
    return true;
  }
  
  if (!userId) {
    return false;
  }

  try {
    const { data: user } = await supabase
      .from('users')
      .select('email, role')
      .eq('id', userId)
      .single();
    
    if (!user || (user.email !== ADMIN_EMAIL && user.role !== 'ADMIN')) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// GET - Fetch pending posts and comments for moderation
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending posts
    const { data: pendingPosts } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', false)
      .order('created_at', { ascending: false });

    // Get pending comments
    const { data: pendingComments } = await supabase
      .from('comments')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    // Get stats
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true });

    const { count: totalComments } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true });

    return NextResponse.json({
      pendingPosts: pendingPosts || [],
      pendingComments: pendingComments || [],
      stats: {
        totalPosts: totalPosts || 0,
        totalComments: totalComments || 0,
        totalLikes: 0,
      },
    });
  } catch (error) {
    console.error('Admin moderation GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Approve or delete posts/comments
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, type, id } = body;

    if (!action || !type || !id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    if (action === 'approve') {
      if (type === 'post') {
        await supabase
          .from('posts')
          .update({ is_published: true })
          .eq('id', id);
      } else {
        await supabase
          .from('comments')
          .update({ is_approved: true })
          .eq('id', id);
      }

      return NextResponse.json({ success: true, message: 'تمت الموافقة بنجاح' });
    }

    if (action === 'delete') {
      if (type === 'post') {
        await supabase
          .from('posts')
          .delete()
          .eq('id', id);
      } else {
        await supabase
          .from('comments')
          .delete()
          .eq('id', id);
      }

      return NextResponse.json({ success: true, message: 'تم الحذف بنجاح' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin moderation POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
