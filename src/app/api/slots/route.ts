// src/app/api/slots/route.ts
import { NextResponse } from 'next/server';
import { generateDaySlots } from '@/lib/slots';
import { ApiResponse } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Default to today's date if no date parameter provided
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const slots = await generateDaySlots(date);

    const response: ApiResponse<typeof slots> = {
      success: true,
      data: slots,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate time slots' },
      { status: 500 }
    );
  }
}