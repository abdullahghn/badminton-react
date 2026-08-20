// src/app/api/courts/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const courts = await prisma.court.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, data: courts });
  } catch (error: any) {
    console.error('Fetch courts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courts list.' },
      { status: 500 }
    );
  }
}