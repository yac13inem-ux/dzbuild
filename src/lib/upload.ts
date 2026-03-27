import { supabase } from './db';

// Convert file to base64 data URL (primary method - works without Storage bucket)
async function fileToDataUrl(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
}

// Upload file - tries Supabase Storage first, falls back to base64
export async function uploadToSupabase(
  file: File,
  bucket: string = 'uploads',
  folder: string = ''
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = folder 
      ? `${folder}/${timestamp}-${randomStr}.${extension}`
      : `${timestamp}-${randomStr}.${extension}`;

    // Convert File to ArrayBuffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try Supabase Storage first
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!error && data) {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filename);

        if (urlData.publicUrl) {
          console.log('File uploaded to Supabase Storage:', urlData.publicUrl);
          return { success: true, url: urlData.publicUrl };
        }
      }
    } catch (storageError) {
      console.log('Supabase Storage not available, using base64 fallback');
    }

    // Fallback to base64 data URL (always works)
    const dataUrl = await fileToDataUrl(file);
    console.log('File converted to base64, size:', dataUrl.length);
    return { success: true, url: dataUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
}

// Upload multiple files
export async function uploadMultiple(
  files: File[],
  bucket: string = 'uploads',
  folder: string = ''
): Promise<{ success: boolean; urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await uploadToSupabase(file, bucket, folder);
    if (result.success && result.url) {
      urls.push(result.url);
    } else {
      errors.push(result.error || 'Unknown error');
    }
  }

  return { success: errors.length === 0, urls, errors };
}
