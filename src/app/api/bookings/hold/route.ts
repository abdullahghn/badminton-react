// src/app/api/bookings/hold/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSlotPriceSar } from '@/lib/pricing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courtId, guestName, guestPhone, startTime: rawStartTime, dateStr, startHour } = body;

    // Strict phone number validation
    const cleanPhone = guestPhone?.trim();
    if (!cleanPhone || cleanPhone.length < 9) {
      return NextResponse.json(
        { success: false, error: 'A valid phone number (e.g. 05XXXXXXXX) is required.' },
        { status: 400 }
      );
    }

    if (!guestName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required.' },
        { status: 400 }
      );
    }

    if (!courtId) {
      return NextResponse.json(
        { success: false, error: 'Court selection is required.' },
        { status: 400 }
      );
    }

    let startTime: Date;
    if (rawStartTime) {
      startTime = new Date(rawStartTime);
    } else if (dateStr && startHour !== undefined) {
      startTime = new Date(`${dateStr}T${String(startHour).padStart(2, '0')}:00:00`);
    } else {
      return NextResponse.json(
        { success: false, error: 'Valid booking start time or date/hour is required.' },
        { status: 400 }
      );
    }

    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const hourNumber = startTime.getHours();

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
        { success: false, error: 'Selected time slot is no longer available.' },
        { status: 409 }
      );
    }

    const totalPriceSar = await getSlotPriceSar(startTime, hourNumber);
    const refCode = `PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const booking = await prisma.booking.create({
      data: {
        courtId,
        guestName: guestName.trim(),
        guestPhone: cleanPhone,
        startTime,
        endTime,
        status: 'PENDING_PAYMENT',
        paymentMethod: 'PAY_AT_VENUE',
        totalPriceSar,
        paymentRef: refCode,
        createdByUserId: null,
      },
      include: { court: true },
    });

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Pay-at-venue hold error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete slot reservation.' },
      { status: 500 }
    );
  }
}