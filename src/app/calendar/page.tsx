// src/app/calendar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { TimeSlot } from '@/types';
import { Header } from '@/components/calendar/Header';
import { CourtSection } from '@/components/calendar/CourtSection';
import { WalkInModal } from '@/components/calendar/WalkInModal';
import BookingConfirmationModal from '@/components/BookingConfirmationModal';

export default function CalendarPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Confirmation State
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('05');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'POS_TERMINAL'>('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Confirmation Modal State
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const fetchSlots = () => {
    setLoading(true);
    fetch(`/api/slots?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSlots(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDate]);

  const handleReserveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    if (!guestName.trim()) {
      setModalError('Please enter customer name.');
      return;
    }

    if (!guestPhone || guestPhone.length < 9) {
      setModalError('Please enter a valid mobile number (e.g. 05XXXXXXXX).');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      const res = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: selectedSlot.courtId,
          guestName,
          guestPhone,
          startTime: selectedSlot.startTime,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setConfirmedBooking(data.data);
        setSelectedSlot(null);
        fetchSlots();
      } else {
        setModalError(data.error || 'Reservation hold failed.');
      }
    } catch {
      setModalError('An unexpected error occurred while processing reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const courtNames = Array.from(new Set(slots.map((s) => s.courtName)));

  return (
    <div
      className={`min-h-screen font-sans pb-16 transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-900'
      }`}
    >
      <Header
        selectedDate={selectedDate}
        darkMode={darkMode}
        onDateChange={setSelectedDate}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {loading ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-gray-200 shadow-sm font-extrabold uppercase">
            ⚡ Loading courts...
          </div>
        ) : slots.length === 0 ? (
          <div className="p-16 text-center text-slate-500 bg-white rounded-3xl border border-gray-200 shadow-sm font-bold">
            No active courts found for this date.
          </div>
        ) : (
          courtNames.map((courtName) => (
            <CourtSection
              key={courtName}
              courtName={courtName}
              slots={slots.filter((s) => s.courtName === courtName)}
              darkMode={darkMode}
              onOnlineBook={(slot) => {
                setSelectedSlot(slot);
                setGuestName('');
                setGuestPhone('05');
                setModalError(null);
              }}
              onCashBook={(slot, e) => {
                e.stopPropagation();
                setSelectedSlot(slot);
                setGuestName('');
                setGuestPhone('05');
                setModalError(null);
              }}
            />
          ))
        )}
      </main>

      <WalkInModal
        selectedSlot={selectedSlot}
        guestName={guestName}
        guestPhone={guestPhone}
        paymentMethod={paymentMethod}
        submitting={submitting}
        modalError={modalError}
        onClose={() => setSelectedSlot(null)}
        onNameChange={setGuestName}
        onPhoneChange={setGuestPhone}
        onPaymentMethodChange={setPaymentMethod}
        onSubmit={handleReserveSlot}
      />

      <BookingConfirmationModal
        isOpen={!!confirmedBooking}
        bookingData={confirmedBooking}
        onClose={() => setConfirmedBooking(null)}
      />
    </div>
  );
}