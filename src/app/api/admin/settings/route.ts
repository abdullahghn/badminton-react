// src/app/api/admin/settings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

// GET /api/admin/settings - Fetch current facility operating settings
export async function GET() {
  try {
    let settings = await prisma.facilitySetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.facilitySetting.create({
        data: { id: 'default' },
      });
    }

    const response: ApiResponse<typeof settings> = {
      success: true,
      data: settings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch facility settings' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update operating hours and cancellation settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { 
      operatingStartHour, 
      operatingEndHour, 
      cancellationMode, 
      cancellationBufferHours 
    } = body;

    const updatedSettings = await prisma.facilitySetting.update({
      where: { id: 'default' },
      data: {
        operatingStartHour: Number(operatingStartHour),
        operatingEndHour: Number(operatingEndHour),
        cancellationMode,
        cancellationBufferHours: Number(cancellationBufferHours),
      },
    });

    const response: ApiResponse<typeof updatedSettings> = {
      success: true,
      message: 'Facility settings updated successfully',
      data: updatedSettings,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update facility settings' },
      { status: 500 }
    );
  }
}