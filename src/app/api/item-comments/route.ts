import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// Generate a simple edit token
function generateEditToken(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

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

    // Return comments (edit_token is not returned for security)
    return NextResponse.json({ 
      comments: (data || []).map(c => ({
        id: c.id,
        author_name: c.author_name,
        content: c.content,
        like_count: c.like_count,
        created_at: c.created_at,
      }))
    });
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

    // Validate content length
    if (content.length < 3) {
      return NextResponse.json(
        { error: 'Comment too short (min 3 chars)' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment too long (max 1000 chars)' },
        { status: 400 }
      );
    }

    // Generate a unique ID and edit token
    const id = `comm-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const editToken = generateEditToken();

    const insertData: Record<string, unknown> = {
      id,
      post_id: `${item_type}_${item_id}`,
      author_name: name.trim(),
      content: content.trim(),
      edit_token: editToken,
      is_approved: true,
      like_count: 0,
      created_at: new Date().toISOString(),
    };

    // Try inserting with edit_token first
    let { data: comment, error } = await supabase
      .from('comments')
      .insert(insertData)
      .select()
      .single();

    // If edit_token column doesn't exist, retry without it
    if (error?.message?.includes('edit_token') || error?.message?.includes('column')) {
      console.log('Retrying without edit_token column...');
      const insertDataWithoutToken = { ...insertData };
      delete insertDataWithoutToken.edit_token;
      
      const result = await supabase
        .from('comments')
        .insert(insertDataWithoutToken)
        .select()
        .single();
      
      comment = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Create comment error:', error);
      return NextResponse.json({ 
        error: 'Failed to add comment: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      comment: {
        id: comment.id,
        author_name: comment.author_name,
        content: comment.content,
        edit_token: editToken, // Return token to frontend for ownership
        created_at: comment.created_at,
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

// DELETE - Delete a comment (requires edit_token)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const editToken = searchParams.get('edit_token');

    if (!id) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });
    }

    // Get the comment first to verify ownership
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('id, edit_token')
      .eq('id', id)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Verify edit token (if comment has one and we have one to check)
    if (existingComment.edit_token && editToken && existingComment.edit_token !== editToken) {
      return NextResponse.json({ 
        error: 'Invalid edit token. You do not have permission to delete this comment.' 
      }, { status: 403 });
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

// PUT - Edit a comment (requires edit_token)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, edit_token } = body;

    if (!id || !content) {
      return NextResponse.json(
        { error: 'Comment ID and content are required' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 3 || content.length > 1000) {
      return NextResponse.json(
        { error: 'Invalid content length' },
        { status: 400 }
      );
    }

    // Get the comment first to verify ownership
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('id, edit_token')
      .eq('id', id)
      .single();

    if (fetchError || !existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Verify edit token (if comment has one and we have one to check)
    // Skip verification if comment doesn't have edit_token in DB (column doesn't exist)
    if (existingComment.edit_token && edit_token && existingComment.edit_token !== edit_token) {
      return NextResponse.json({ 
        error: 'Invalid edit token. You do not have permission to edit this comment.' 
      }, { status: 403 });
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update comment error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error('Edit comment error:', error);
    return NextResponse.json({ error: 'Failed to edit comment' }, { status: 500 });
  }
}
