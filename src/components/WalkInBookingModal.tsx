// src/components/WalkInBookingModal.tsx
'use client';

import { useState, useEffect } from 'react';

interface Court {
  id: string;
  name: string;
}

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WalkInBookingModal({ isOpen, onClose, onSuccess }: WalkInModalProps) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('05');
  const [dateStr, setDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [startHour, setStartHour] = useState(17);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'POS_TERMINAL'>('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Try /api/admin/courts first, fallback to /api/courts
      const loadCourts = async () => {
        try {
          let res = await fetch('/api/admin/courts');
          if (!res.ok) {
            res = await fetch('/api/courts');
          }

          const contentType = res.headers.get('content-type');
          if (res.ok && contentType && contentType.includes('application/json')) {
            const data = await res.json();
            const courtList = data.data || data;
            if (Array.isArray(courtList)) {
              setCourts(courtList);
              if (courtList.length > 0) setSelectedCourt(courtList[0].id);
            }
          } else {
            console.error('Courts API returned non-JSON response');
          }
        } catch (err) {
          console.error('Error fetching courts for modal:', err);
        }
      };

      loadCourts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/bookings/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: selectedCourt,
          guestName,
          guestPhone,
          dateStr,
          startHour: Number(startHour),
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit walk-in booking.');
      }

      setGuestName('');
      setGuestPhone('05');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const formatted = hour % 12 || 12;
    return `${formatted}:00 ${period}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        {/* HEADER */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black">⚡ Front-Desk Walk-In Booking</h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Instant cash / POS desk reservation</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-bold">
          {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">{error}</div>}

          <div>
            <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Select Court</label>
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
            >
              {courts.map((court) => (
                <option key={court.id} value={court.id}>{court.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Date</label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Time Slot</label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none"
              >
                {Array.from({ length: 16 }).map((_, i) => {
                  const hour = i + 8; // 8:00 AM - 11:00 PM
                  return <option key={hour} value={hour}>{formatHour(hour)}</option>;
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Guest Name</label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Mobile Number</label>
              <input
                type="text"
                required
                placeholder="05XXXXXXXX"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-2 px-3 rounded-xl border text-center transition font-extrabold ${
                  paymentMethod === 'CASH'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                💵 Cash Drawer
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('POS_TERMINAL')}
                className={`py-2 px-3 rounded-xl border text-center transition font-extrabold ${
                  paymentMethod === 'POS_TERMINAL'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                💳 POS Card Machine
              </button>
            </div>
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Walk-In Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}