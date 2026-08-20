// src/components/WalkInBookingModal.tsx
'use client';

import { useState, useEffect } from 'react';

interface WalkInBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WalkInBookingModal({
  isOpen,
  onClose,
  onSuccess,
}: WalkInBookingModalProps) {
  const [courts, setCourts] = useState<{ id: string; name: string }[]>([]);
  const [courtId, setCourtId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('05');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState<number>(8);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'POS_TERMINAL'>('CASH');

  // Slot Availability State
  const [slots, setSlots] = useState<{ hour: number; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Courts
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/courts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.length) {
          setCourts(data.data);
          if (!courtId) setCourtId(data.data[0].id);
        }
      })
      .catch(console.error);
  }, [isOpen]);

  // Fetch Slots when Date or Court changes
  useEffect(() => {
    if (!isOpen || !courtId || !dateStr) return;

    setLoadingSlots(true);
    fetch(`/api/slots?date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const courtSlots = data.data
            .filter((s: any) => s.courtId === courtId)
            .map((s: any) => ({
              hour: new Date(s.startTime).getHours(),
              available: s.isAvailable,
            }));
          setSlots(courtSlots);

          // Default selected hour to the first available slot if current is booked
          const currentSlot = courtSlots.find((s: any) => s.hour === startHour);
          if (currentSlot && !currentSlot.available) {
            const firstAvail = courtSlots.find((s: any) => s.available);
            if (firstAvail) setStartHour(firstAvail.hour);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSlots(false));
  }, [isOpen, courtId, dateStr]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtId || !guestName.trim() || !guestPhone.trim()) {
      setError('All fields are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/bookings/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          dateStr,
          startHour: Number(startHour),
          paymentMethod,
        }),
      });

      const result = await res.json();
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || 'Failed to create walk-in booking.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-6 space-y-5">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">⚡ New Walk-In Booking</h2>
            <p className="text-xs text-slate-500 font-medium">Record desk payment directly in the ledger</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Customer Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sultan Al-Otaibi"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile Phone</label>
            <input
              type="tel"
              required
              placeholder="05XXXXXXXX"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Court</label>
              <select
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
              >
                {courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏸 {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* DYNAMIC SLOT AVAILABILITY SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Time Slot {loadingSlots && <span className="text-indigo-600 text-[10px] lowercase">(checking availability...)</span>}
            </label>
            <select
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              {Array.from({ length: 16 }, (_, i) => i + 8).map((hour) => {
                const slotInfo = slots.find((s) => s.hour === hour);
                const isBooked = slotInfo ? !slotInfo.available : false;
                const formattedTime = hour >= 12 ? `${hour === 12 ? 12 : hour - 12}:00 PM` : `${hour}:00 AM`;

                return (
                  <option key={hour} value={hour} disabled={isBooked}>
                    {formattedTime} {isBooked ? '❌ (Booked / Held)' : '🟢 Available'}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'CASH' | 'POS_TERMINAL')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
            >
              <option value="CASH">💵 Cash at Desk</option>
              <option value="POS_TERMINAL">💳 POS Card Machine</option>
            </select>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}