// src/app/api/bookings/hold/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSlotPriceSar } from '@/lib/pricing';
import { CreateOnlineBookingDTO, ApiResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body: CreateOnlineBookingDTO = await request.json();
    const { courtId, startTime, userId, paymentMethod } = body;

    if (!courtId || !startTime) {
      return NextResponse.json(
        { success: false, error: 'Court and start time are required' },
        { status: 400 }
      );
    }

    const slotStart = new Date(startTime);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotStart.getHours() + 1);

    const now = new Date();

    // 1. Verify slot is not already booked or currently on an active lock
    const existingBooking = await prisma.booking.findFirst({
      where: {
        courtId,
        startTime: slotStart,
        OR: [
          { status: 'CONFIRMED' },
          {
            status: 'PENDING_PAYMENT',
            lockExpiresAt: { gt: now },
          },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'This time slot is no longer available.' },
        { status: 409 }
      );
    }

    // 2. Read facility settings for lock duration (default 10 mins)
    const settings = await prisma.facilitySetting.findUnique({
      where: { id: 'default' },
    });
    const lockMinutes = settings?.slotHoldDurationMins ?? 10;

    // 3. Calculate lock expiration date
    const lockExpiresAt = new Date(now.getTime() + lockMinutes * 60 * 1000);

    // 4. Calculate price in SAR
    const priceSar = await getSlotPriceSar(slotStart);

    // 5. Create PENDING_PAYMENT booking
    const booking = await prisma.booking.create({
      data: {
        courtId,
        userId: userId || null,
        startTime: slotStart,
        endTime: slotEnd,
        status: 'PENDING_PAYMENT',
        paymentMethod,
        totalPriceSar: priceSar,
        lockExpiresAt,
      },
    });

    const response: ApiResponse<typeof booking> = {
      success: true,
      message: `Slot locked for ${lockMinutes} minutes`,
      data: booking,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating booking hold:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to hold time slot' },
      { status: 500 }
    );
  }
}