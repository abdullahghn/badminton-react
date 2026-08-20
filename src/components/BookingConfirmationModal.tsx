// src/components/BookingConfirmationModal.tsx
'use client';

interface ConfirmationModalProps {
  isOpen: boolean;
  bookingData: any;
  onClose: () => void;
}

export default function BookingConfirmationModal({ isOpen, bookingData, onClose }: ConfirmationModalProps) {
  if (!isOpen || !bookingData) return null;

  const start = new Date(bookingData.startTime);
  const formattedDate = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 text-center p-6 space-y-5">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto font-black">
          ✓
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Slot Reserved!</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Please present this booking reference at reception upon arrival to complete your payment.
          </p>
        </div>

        {/* BOOKING REFERENCE BADGE */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Reference Code</div>
          <div className="text-2xl font-mono font-black text-indigo-600 tracking-widest">
            {bookingData.paymentRef}
          </div>
        </div>

        {/* RESERVATION DETAILS */}
        <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 text-left font-bold text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Court:</span>
            <span>🏸 {bookingData.court?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Schedule:</span>
            <span>{formattedDate} @ {formattedTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Player:</span>
            <span>{bookingData.guestName}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <span className="text-slate-400 font-medium">Amount Due at Desk:</span>
            <span className="text-indigo-600 font-black">{Number(bookingData.totalPriceSar).toFixed(2)} SAR</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition shadow-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
}