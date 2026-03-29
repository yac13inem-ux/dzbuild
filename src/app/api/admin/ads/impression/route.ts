import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Ad ID required' }, { status: 400 });
    }

    await db.advertisement.update({
      where: { id },
      data: {
        impressions: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Impression error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
