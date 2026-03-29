import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Track ad view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get current impressions count and update
    const ad = await db.advertisement.findUnique({
      where: { id },
      select: { impressions: true },
    });

    if (ad) {
      await db.advertisement.update({
        where: { id },
        data: { impressions: (ad.impressions || 0) + 1 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
