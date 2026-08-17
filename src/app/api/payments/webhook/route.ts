// src/app/api/payments/webhook/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, paymentRef, status } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking record not found' },
        { status: 404 }
      );
    }

    // Check if slot lock expired before payment was completed
    if (booking.status === 'PENDING_PAYMENT' && booking.lockExpiresAt) {
      if (new Date() > new Date(booking.lockExpiresAt)) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'EXPIRED' },
        });

        return NextResponse.json(
          { success: false, error: 'Payment lock time expired before transaction completed' },
          { status: 410 }
        );
      }
    }

    if (status === 'SUCCESS' || status === 'paid') {
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          paymentRef: paymentRef || `MOCK_TXN_${Date.now()}`,
          lockExpiresAt: null, // Clear timer upon success
        },
      });

      const response: ApiResponse<typeof updatedBooking> = {
        success: true,
        message: 'Payment confirmed and booking finalized!',
        data: updatedBooking,
      };

      return NextResponse.json(response);
    } else {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      return NextResponse.json(
        { success: false, error: 'Payment transaction failed or was declined' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Payment processing error' },
      { status: 500 }
    );
  }
}