import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Update user profile (avatar, name, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, avatar, bio, city, wilaya, specialization, website, phone, experience } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (bio !== undefined) updateData.bio = bio;
    if (city !== undefined) updateData.city = city;
    if (wilaya !== undefined) updateData.wilaya = wilaya;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (website !== undefined) updateData.website = website;
    if (phone !== undefined) updateData.phone = phone;
    if (experience !== undefined) updateData.experience = experience;

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        bio: true,
        city: true,
        wilaya: true,
        specialization: true,
        website: true,
        phone: true,
        rating: true,
        reviewCount: true,
        projectCount: true,
        experience: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        bio: user.bio,
        city: user.city,
        wilaya: user.wilaya,
        specialization: user.specialization,
        website: user.website,
        phone: user.phone,
        rating: user.rating,
        reviewCount: user.reviewCount,
        projectCount: user.projectCount,
        experience: user.experience,
      }
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
