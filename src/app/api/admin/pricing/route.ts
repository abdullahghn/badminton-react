// src/app/api/admin/pricing/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/pricing - Fetch all pricing rules
export async function GET() {
  try {
    let rules = await prisma.pricingRule.findMany({
      orderBy: { startHour: 'asc' },
    });

    // Seed default rules if none exist
    if (rules.length === 0) {
      await prisma.pricingRule.createMany({
        data: [
          { name: 'Standard Off-Peak', dayType: 'WEEKDAY', startHour: 8, endHour: 17, ratePerHour: 80.00, isPeak: false },
          { name: 'Prime Evening Surge', dayType: 'WEEKDAY', startHour: 17, endHour: 23, ratePerHour: 120.00, isPeak: true },
          { name: 'Weekend Full Day', dayType: 'WEEKEND', startHour: 8, endHour: 23, ratePerHour: 140.00, isPeak: true },
        ],
      });
      rules = await prisma.pricingRule.findMany({ orderBy: { startHour: 'asc' } });
    }

    return NextResponse.json({ success: true, data: rules });
  } catch (error: any) {
    console.error('Error fetching pricing rules:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve pricing rules' }, { status: 500 });
  }
}

// POST /api/admin/pricing - Create a new rule
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, dayType, startHour, endHour, ratePerHour, isPeak } = body;

    const newRule = await prisma.pricingRule.create({
      data: {
        name,
        dayType,
        startHour: Number(startHour),
        endHour: Number(endHour),
        ratePerHour: Number(ratePerHour),
        isPeak: Boolean(isPeak),
      },
    });

    return NextResponse.json({ success: true, data: newRule });
  } catch (error: any) {
    console.error('Error creating pricing rule:', error);
    return NextResponse.json({ success: false, error: 'Failed to create pricing rule' }, { status: 500 });
  }
}

// PATCH /api/admin/pricing - Update rule active status or rate
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ratePerHour, isActive } = body;

    const updated = await prisma.pricingRule.update({
      where: { id },
      data: {
        ...(ratePerHour !== undefined && { ratePerHour: Number(ratePerHour) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating rule:', error);
    return NextResponse.json({ success: false, error: 'Failed to update rule' }, { status: 500 });
  }
}