import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, secretKey } = body;

    // Security check
    if (secretKey !== 'dzbuild-secret-2026') {
      return NextResponse.json({
        success: false,
        error: 'Invalid secret key',
      }, { status: 401 });
    }

    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        error: 'Email, password, and name are required',
      }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Admin already exists',
        adminEmail: existingAdmin.email,
      });
    }

    // Check if user with this email exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    const hashedPassword = await hashPassword(password);

    if (existingUser) {
      // Update to admin
      const updatedUser = await db.user.update({
        where: { email: normalizedEmail },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
          name: name.trim(),
          isVerified: true,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'User updated to admin',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      });
    }

    // Create new admin user
    const admin = await db.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name.trim(),
        role: 'ADMIN',
        isVerified: true,
        isActive: true,
        isEmailVerified: true,
        rating: 0,
        reviewCount: 0,
        projectCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString(),
    }, { status: 500 });
  }
}
