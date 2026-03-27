import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET comments for an item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemType = searchParams.get('item_type');
    const itemId = searchParams.get('item_id');

    if (!itemType || !itemId) {
      return NextResponse.json({ comments: [] });
    }

    // Use comments table with composite key stored in post_id
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', `${itemType}_${itemId}`)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ comments: [] });
    }

    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    console.error('Comments API error:', error);
    return NextResponse.json({ comments: [] });
  }
}

// POST - Add a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_type, item_id, name, content } = body;

    if (!item_type || !item_id || !name || !content) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Generate a unique ID
    const id = `comm-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        id,
        post_id: `${item_type}_${item_id}`,
        author_name: name,
        content,
        is_approved: true,
        like_count: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Create comment error:', error);
      return NextResponse.json({ 
        error: 'Failed to add comment: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

// DELETE - Delete a comment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
