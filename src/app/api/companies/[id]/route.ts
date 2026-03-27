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

// PUT - Update company
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
    } = body;

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

// DELETE - Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
