import { NextResponse } from 'next/server';
import { uploadToSupabase } from '@/lib/upload';

// POST - Upload image for library
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    console.log('Upload request received, file:', file?.name, 'size:', file?.size, 'type:', file?.type);
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type - allow images and PDFs for library
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF are allowed.' 
      }, { status: 400 });
    }
    
    // Validate file size (max 10MB for library files)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }
    
    // Upload to Supabase Storage
    const result = await uploadToSupabase(file, 'uploads', 'library');
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Upload failed' 
      }, { status: 500 });
    }
    
    console.log('File uploaded successfully:', result.url);
    
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
