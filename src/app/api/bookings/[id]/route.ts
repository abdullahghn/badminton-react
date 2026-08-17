// src/app/api/bookings/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        court: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof booking> = {
      success: true,
      data: booking,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}