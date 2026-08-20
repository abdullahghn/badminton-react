// src/app/api/slots/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSlotPriceSar } from '@/lib/pricing';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required.' },
        { status: 400 }
      );
    }

    const courts = await prisma.court.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const startOfDay = new Date(`${dateStr}T00:00:00`);
    const endOfDay = new Date(`${dateStr}T23:59:59`);

    // Fetch confirmed AND pending reservations for the target date
    const existingBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] },
        startTime: { gte: startOfDay, lte: endOfDay },
      },
    });

    const slots: any[] = [];
    const operatingHours = Array.from({ length: 16 }, (_, i) => i + 8); // 8 AM - 11 PM

    for (const court of courts) {
      for (const hour of operatingHours) {
        const slotStartTime = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`);
        const slotEndTime = new Date(slotStartTime.getTime() + 60 * 60 * 1000);

        const isBooked = existingBookings.some((b) => {
          return (
            b.courtId === court.id &&
            new Date(b.startTime).getTime() === slotStartTime.getTime()
          );
        });

        const priceSar = await getSlotPriceSar(slotStartTime, hour);

        slots.push({
          id: `${court.id}-${hour}`,
          courtId: court.id,
          courtName: court.name,
          startTime: slotStartTime.toISOString(),
          endTime: slotEndTime.toISOString(),
          isAvailable: !isBooked,
          priceSar,
        });
      }
    }

    return NextResponse.json({ success: true, data: slots });
  } catch (error: any) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch slots.' },
      { status: 500 }
    );
  }
}