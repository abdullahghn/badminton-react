// src/app/api/admin/bookings/cash/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSlotPriceSar } from '@/lib/pricing';
import { CreateCashBookingDTO, ApiResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body: CreateCashBookingDTO = await request.json();
    const { courtId, startTime, guestName, guestPhone, paymentMethod } = body;

    if (!courtId || !startTime || !guestName || !guestPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    const slotStart = new Date(startTime);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotStart.getHours() + 1);

    // 1. Double-check slot availability in DB
    const existingBooking = await prisma.booking.findFirst({
      where: {
        courtId,
        startTime: slotStart,
        OR: [
          { status: 'CONFIRMED' },
          {
            status: 'PENDING_PAYMENT',
            lockExpiresAt: { gt: new Date() },
          },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked or on hold.' },
        { status: 409 }
      );
    }

    // 2. Calculate exact price in SAR
    const priceSar = await getSlotPriceSar(slotStart);

    // 3. Create immediate CONFIRMED booking record
    const booking = await prisma.booking.create({
      data: {
        courtId,
        startTime: slotStart,
        endTime: slotEnd,
        guestName,
        guestPhone,
        status: 'CONFIRMED',
        paymentMethod,
        totalPriceSar: priceSar,
      },
    });

    const response: ApiResponse<typeof booking> = {
      success: true,
      message: 'Walk-in cash booking confirmed successfully!',
      data: booking,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating cash booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process cash booking' },
      { status: 500 }
    );
  }
}