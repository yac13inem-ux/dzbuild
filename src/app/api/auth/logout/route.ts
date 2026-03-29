import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح / Déconnexion réussie',
    });

    // Clear all auth cookies
    response.cookies.delete('user-id');
    response.cookies.delete('user-role');
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    response.cookies.delete('dzbuild_session');
    response.cookies.delete('dzbuild_user_id');

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الخروج / Déconnexion réussie',
    });

    response.cookies.delete('user-id');
    response.cookies.delete('user-role');
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    response.cookies.delete('dzbuild_session');
    response.cookies.delete('dzbuild_user_id');

    return response;
  }
}
