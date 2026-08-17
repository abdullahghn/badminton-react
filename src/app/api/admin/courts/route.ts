// src/app/api/admin/courts/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

// GET /api/admin/courts - Fetch all courts
export async function GET() {
  try {
    const courts = await prisma.court.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const response: ApiResponse<typeof courts> = {
      success: true,
      data: courts,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching admin courts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courts' },
      { status: 500 }
    );
  }
}

// POST /api/admin/courts - Create a new court
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Court name is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.court.findFirst({
      where: { name: name.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `A court named "${name.trim()}" already exists.` },
        { status: 409 }
      );
    }

    const newCourt = await prisma.court.create({
      data: {
        name: name.trim(),
        isActive: true,
      },
    });

    const response: ApiResponse<typeof newCourt> = {
      success: true,
      message: 'Court added successfully!',
      data: newCourt,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error creating court:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create new court' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/courts - Toggle active/inactive status or rename court
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Court ID is required' },
        { status: 400 }
      );
    }

    const updatedCourt = await prisma.court.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    const response: ApiResponse<typeof updatedCourt> = {
      success: true,
      message: 'Court updated successfully',
      data: updatedCourt,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error updating court:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update court' },
      { status: 500 }
    );
  }
}