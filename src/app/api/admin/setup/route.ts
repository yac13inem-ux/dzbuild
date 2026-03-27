import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// This endpoint creates an admin user if no admin exists
// It should be called once during setup

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET() {
  try {
    // Check if admin exists
    const adminCount = await db.user.count({
      where: { role: 'ADMIN' },
    });

    return NextResponse.json({
      hasAdmin: adminCount > 0,
      adminCount,
    });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json(
      { error: 'Database error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, setupKey } = body;

    // Simple security: require a setup key
    // In production, this should be more secure
    if (setupKey !== 'dzbuild-setup-2026') {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 401 }
      );
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists', adminEmail: existingAdmin.email },
        { status: 400 }
      );
    }

    // Check if email is already used
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Update to admin
      const hashedPassword = await hashPassword(password);
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
        message: 'User updated to admin successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    }

    // Create new admin
    const hashedPassword = await hashPassword(password);
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
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create admin', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
