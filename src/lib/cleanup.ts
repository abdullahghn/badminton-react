// src/lib/cleanup.ts
import { prisma } from '@/lib/prisma';

/**
 * Automatically marks any overdue PENDING_PAYMENT slots as EXPIRED in PostgreSQL.
 */
export async function cleanupExpiredHolds() {
  try {
    const now = new Date();
    await prisma.booking.updateMany({
      where: {
        status: 'PENDING_PAYMENT',
        lockExpiresAt: { lte: now },
      },
      data: {
        status: 'EXPIRED',
      },
    });
  } catch (error) {
    console.error('Failed to cleanup expired slot holds:', error);
  }
}