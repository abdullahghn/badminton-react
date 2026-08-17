// src/app/checkout/[bookingId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface BookingDetails {
  id: string;
  totalPriceSar: string | number;
  paymentMethod: string;
  status: string;
  lockExpiresAt: string | null;
  startTime: string;
  court: {
    name: string;
  };
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBooking(data.data);

          if (data.data.lockExpiresAt) {
            const expires = new Date(data.data.lockExpiresAt).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((expires - now) / 1000));
            setSecondsLeft(diff);
          }
        } else {
          setErrorMessage(data.error || 'Booking session not found');
        }
      })
      .catch(() => setErrorMessage('Failed to load checkout details'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0 || isSuccess) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, isSuccess]);

  const handlePay = async (method: 'MADA' | 'APPLE_PAY' | 'CARD') => {
    setProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          status: 'SUCCESS',
          paymentRef: `MOYASAR_TXN_${method}_${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(data.error || 'Payment failed');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during payment');
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-500 flex items-center justify-center font-sans">
        Loading payment checkout...
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center font-sans">
        <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-8 text-center shadow-xl space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
            ✓
          </div>
          <h1 className="text-2xl font-black text-gray-900">Booking Confirmed!</h1>
          <p className="text-sm text-gray-600">
            Your court slot has been secured. See you on the court!
          </p>
          <button
            onClick={() => router.push('/calendar')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl transition"
          >
            Back to Calendar
          </button>
        </div>
      </div>
    );
  }

  const isExpired = secondsLeft !== null && secondsLeft <= 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* TIMER BANNER */}
        {secondsLeft !== null && (
          <div
            className={`p-4 rounded-xl text-center text-xs font-bold border transition ${
              isExpired
                ? 'bg-red-100 border-red-200 text-red-800'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isExpired ? (
              <span>⏱️ Slot lock expired! Please re-select a time slot.</span>
            ) : (
              <span>
                ⏱️ Time remaining to complete payment:{' '}
                <span className="text-base font-mono font-black text-amber-700">
                  {formatTime(secondsLeft)}
                </span>
              </span>
            )}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h1 className="text-xl font-extrabold text-gray-900">Court Checkout</h1>
            <p className="text-xs text-gray-400 mt-1">Order ID: {booking?.id}</p>
          </div>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Court:</span>
              <span className="font-bold text-gray-900">{booking?.court.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time:</span>
              <span className="font-bold text-gray-900">
                {booking?.startTime ? new Date(booking.startTime).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }) : ''}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-100 text-base">
              <span className="font-bold text-gray-800">Total Price:</span>
              <span className="font-black text-emerald-600 text-lg">
                {booking?.totalPriceSar} SAR
              </span>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Select Payment Method
            </p>

            <button
              onClick={() => handlePay('MADA')}
              disabled={isExpired || processing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-4 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              💳 Pay with Mada
            </button>

            <button
              onClick={() => handlePay('APPLE_PAY')}
              disabled={isExpired || processing}
              className="w-full bg-black hover:bg-gray-900 text-white font-extrabold py-3 px-4 rounded-xl shadow-sm transition disabled:opacity-50"
            >
               Pay with Apple Pay
            </button>

            <button
              onClick={() => handlePay('CARD')}
              disabled={isExpired || processing}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl border border-gray-300 transition disabled:opacity-50"
            >
              Credit Card (Visa / Mastercard)
            </button>
          </div>

          {isExpired && (
            <button
              onClick={() => router.push('/calendar')}
              className="w-full bg-gray-800 text-white py-3 rounded-xl text-xs font-bold mt-4"
            >
              Return to Calendar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}