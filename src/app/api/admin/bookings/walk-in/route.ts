// src/app/api/admin/bookings/walk-in/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSlotPriceSar } from '@/lib/pricing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courtId, guestName, guestPhone, dateStr, startHour, paymentMethod } = body;

    if (!courtId || !guestName || !guestPhone || !dateStr || startHour === undefined || !paymentMethod) {
      return NextResponse.json({ success: false, error: 'Missing required walk-in booking fields.' }, { status: 400 });
    }

    const startTime = new Date(`${dateStr}T${String(startHour).padStart(2, '0')}:00:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1-hour slot

    // Prevent double booking over existing confirmed slots
    const existingBooking = await prisma.booking.findFirst({
      where: {
        courtId,
        status: 'CONFIRMED',
        startTime: { lte: startTime },
        endTime: { gt: startTime },
      },
    });

    if (existingBooking) {
      return NextResponse.json({ success: false, error: 'Selected court and time slot is already booked.' }, { status: 409 });
    }

    // Auto-calculate rate based on configured active pricing rules
    const totalPriceSar = await getSlotPriceSar(startTime, Number(startHour));

    // Create immediate CONFIRMED booking record
    const booking = await prisma.booking.create({
      data: {
        courtId,
        guestName,
        guestPhone,
        startTime,
        endTime,
        status: 'CONFIRMED',
        paymentMethod,
        totalPriceSar,
        paymentRef: `WALKIN-${Date.now()}`,
      },
      include: { court: true },
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Walk-in booking creation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record walk-in booking.' }, { status: 500 });
  }
}