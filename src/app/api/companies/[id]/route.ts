import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Get single company
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    return NextResponse.json({ error: 'Failed to get company' }, { status: 500 });
  }
}

// PUT - Update company (requires edit_token for guest posts)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      name,
      company_type,
      type,
      description,
      email,
      phone,
      website,
      city,
      wilaya,
      address,
      logo,
      specialties,
      edit_token,
    } = body;

    // Verify edit_token for guest posts
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('id, edit_token')
      .eq('id', id)
      .single();

    if (fetchError || !existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check edit_token if company has one
    if (existingCompany.edit_token && existingCompany.edit_token !== edit_token) {
      return NextResponse.json({ 
        error: 'Invalid edit token. You do not have permission to edit this company.' 
      }, { status: 403 });
    }

    const { data: company, error } = await supabase
      .from('companies')
      .update({
        name,
        type: company_type || type,
        description,
        email,
        phone,
        website,
        city,
        wilaya,
        address,
        logo,
        specialties,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to update company: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, company });
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

// DELETE - Delete company (requires edit_token for guest posts)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const edit_token = searchParams.get('edit_token');
    
    // Verify edit_token for guest posts
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('id, edit_token')
      .eq('id', id)
      .single();

    if (fetchError || !existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check edit_token if company has one
    if (existingCompany.edit_token && existingCompany.edit_token !== edit_token) {
      return NextResponse.json({ 
        error: 'Invalid edit token. You do not have permission to delete this company.' 
      }, { status: 403 });
    }
    
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to delete company: ' + error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete company error:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}
