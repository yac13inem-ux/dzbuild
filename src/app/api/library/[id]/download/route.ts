import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Increment download count
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await db.video.update({
      where: { id },
      data: { likeCount: { increment: 1 } }, // Using likeCount as downloadCount
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating download count:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
