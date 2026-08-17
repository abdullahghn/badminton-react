// src/lib/pricing.ts
import { prisma } from '@/lib/prisma';
import { DayOfWeek } from '@prisma/client';

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

/**
 * Calculates the SAR price for a 60-minute slot given a start Date object.
 */
export async function getSlotPriceSar(slotStartTime: Date): Promise<number> {
  const dayIndex = slotStartTime.getDay();
  const dayOfWeek = DAY_MAP[dayIndex];
  const hour = slotStartTime.getHours();

  // Query database for a matching pricing rule
  const rule = await prisma.pricingRule.findFirst({
    where: {
      dayOfWeek,
      startHour: { lte: hour },
      endHour: { gt: hour },
    },
  });

  if (rule) {
    return Number(rule.priceSar);
  }

  // Fallback price if no rule matches
  return 100.0;
}