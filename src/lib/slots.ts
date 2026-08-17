// src/lib/slots.ts
import { prisma } from '@/lib/prisma';
import { getSlotPriceSar } from '@/lib/pricing';
import { cleanupExpiredHolds } from '@/lib/cleanup';
import { TimeSlot } from '@/types';

/**
 * Generates all 60-minute slots for a given date across all active courts.
 */
export async function generateDaySlots(dateStr: string): Promise<TimeSlot[]> {
  // 1. Sweep overdue holds first
  await cleanupExpiredHolds();

  // 2. Fetch Facility Settings for operating hours
  const settings = await prisma.facilitySetting.findUnique({
    where: { id: 'default' },
  });

  const startHour = settings?.operatingStartHour ?? 16;
  const endHour = settings?.operatingEndHour ?? 24;

  // 3. Fetch Active Courts
  const courts = await prisma.court.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  // 4. Define date boundaries for DB query
  const targetDate = new Date(dateStr);
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);

  // 5. Fetch all non-expired bookings for this date
  const now = new Date();
  const existingBookings = await prisma.booking.findMany({
    where: {
      startTime: { gte: dayStart, lte: dayEnd },
      OR: [
        { status: 'CONFIRMED' },
        {
          status: 'PENDING_PAYMENT',
          lockExpiresAt: { gt: now },
        },
      ],
    },
  });

  const slots: TimeSlot[] = [];

  // 5. Generate hourly blocks per court
  for (const court of courts) {
    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, 0, 0, 0);

      const slotEnd = new Date(targetDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check for existing booking on this court at this start time
      const matchingBooking = existingBookings.find(
        (b) =>
          b.courtId === court.id &&
          b.startTime.getTime() === slotStart.getTime()
      );

      let status: TimeSlot['status'] = 'FREE';
      if (matchingBooking) {
        status =
          matchingBooking.status === 'CONFIRMED'
            ? 'BOOKED'
            : 'LOCKED_PENDING';
      }

      const priceSar = await getSlotPriceSar(slotStart);

      slots.push({
        courtId: court.id,
        courtName: court.name,
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        priceSar,
        isAvailable: status === 'FREE',
        status,
      });
    }
  }

  return slots;
}