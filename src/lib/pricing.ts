// src/lib/pricing.ts
import { prisma } from '@/lib/prisma';
import { DayType } from '@prisma/client';

export async function calculateSlotPrice(date: Date, startHour?: number): Promise<number> {
  const actualHour = startHour ?? date.getHours();
  const dayIndex = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  const isWeekend = dayIndex === 5 || dayIndex === 6;
  const targetDayType: DayType = isWeekend ? DayType.WEEKEND : DayType.WEEKDAY;

  try {
    // Find matching active pricing rule
    const rule = await prisma.pricingRule.findFirst({
      where: {
        isActive: true,
        OR: [
          { dayType: targetDayType },
          { dayType: DayType.ALL },
        ],
        startHour: { lte: actualHour },
        endHour: { gt: actualHour },
      },
      orderBy: { isPeak: 'desc' }, // Prioritize peak rules if overlapping
    });

    if (rule) {
      return Number(rule.ratePerHour);
    }

    // Default fallback rate if no specific rule matches
    return isWeekend ? 140.00 : 80.00;
  } catch (err) {
    console.error('Error calculating slot price:', err);
    return 100.00; // Safe default
  }
}

// Support both 1-argument (date only) and 2-argument (date + startHour) signatures
export async function getSlotPriceSar(date: Date, startHour?: number): Promise<number> {
  return calculateSlotPrice(date, startHour);
}