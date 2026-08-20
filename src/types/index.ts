// src/types/index.ts
import { 
  Role, 
  CancellationMode, 
  BookingStatus, 
  PaymentMethod, 
  DayType 
} from '@prisma/client';

export { Role, CancellationMode, BookingStatus, PaymentMethod, DayType };

export interface TimeSlot {
  courtId: string;
  courtName: string;
  startTime: string;
  endTime: string;
  priceSar: number;
  isAvailable: boolean;
  status: 'FREE' | 'LOCKED_PENDING' | 'BOOKED' | 'MAINTENANCE';
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

export interface CreateOnlineBookingDTO {
  courtId: string;
  startTime: string;
  userId: string;
  paymentMethod: 'ONLINE_MADA' | 'ONLINE_APPLE_PAY' | 'ONLINE_CARD';
}

export interface CreateCashBookingDTO {
  courtId: string;
  startTime: string;
  guestName: string;
  guestPhone: string;
  paymentMethod: 'CASH' | 'POS_TERMINAL';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}