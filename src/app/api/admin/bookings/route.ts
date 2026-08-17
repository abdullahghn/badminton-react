// src/app/api/admin/bookings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

// GET /api/admin/bookings - Search and filter reservations ledger
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';

    // Build filter conditions
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestPhone: { contains: search, mode: 'insensitive' } },
        { paymentRef: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
        { court: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        court: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
      orderBy: { startTime: 'desc' },
      take: 200, // Fetch up to 200 latest records
    });

    const response: ApiResponse<typeof bookings> = {
      success: true,
      data: bookings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve bookings ledger' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/bookings - Update booking status (Confirm, Cancel, etc.)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Booking ID and target status are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        court: true,
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update status' },
      { status: 500 }
    );
  }
}