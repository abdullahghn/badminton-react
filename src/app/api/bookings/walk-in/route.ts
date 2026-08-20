// src/app/api/admin/bookings/walk-in/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSlotPriceSar } from '@/lib/pricing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courtId, guestName, guestPhone, dateStr, startHour, paymentMethod, staffUserId } = body;

    if (!courtId || !guestName || !guestPhone || !dateStr || startHour === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking details.' },
        { status: 400 }
      );
    }

    const startTime = new Date(`${dateStr}T${String(startHour).padStart(2, '0')}:00:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    // Check for existing bookings
    const existing = await prisma.booking.findFirst({
      where: {
        courtId,
        status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
        startTime: { lte: startTime },
        endTime: { gt: startTime },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already reserved.' },
        { status: 409 }
      );
    }

    const totalPriceSar = await getSlotPriceSar(startTime, Number(startHour));
    const refCode = `DESK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create directly CONFIRMED walk-in booking and assign createdByUserId & confirmedByUserId
    const booking = await prisma.booking.create({
      data: {
        courtId,
        guestName,
        guestPhone,
        startTime,
        endTime,
        status: 'CONFIRMED',
        paymentMethod: paymentMethod || 'CASH',
        totalPriceSar,
        paymentRef: refCode,
        createdByUserId: staffUserId || null,
        confirmedByUserId: staffUserId || null,
      },
      include: { court: true },
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Walk-in booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create walk-in booking.' },
      { status: 500 }
    );
  }
}