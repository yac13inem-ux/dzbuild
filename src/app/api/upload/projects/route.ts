import { NextResponse } from 'next/server';
import { uploadToSupabase } from '@/lib/upload';

// POST - Upload image for projects
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      }, { status: 400 });
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }
    
    // Upload to Supabase Storage
    const result = await uploadToSupabase(file, 'uploads', 'projects');
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Upload failed' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      url: result.url,
      filename: result.url?.split('/').pop()
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file: ' + (error as Error).message 
    }, { status: 500 });
  }
}
