import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Track ad click
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get current clicks count and update
    const ad = await db.advertisement.findUnique({
      where: { id },
      select: { clicks: true },
    });

    if (ad) {
      await db.advertisement.update({
        where: { id },
        data: { clicks: (ad.clicks || 0) + 1 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
