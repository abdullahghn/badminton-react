// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: { email: cleanEmail },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = await signToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      data: sessionUser,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return response;
  } catch (error: any) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}