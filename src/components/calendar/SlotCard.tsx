// src/components/calendar/SlotCard.tsx
'use client';

import { TimeSlot } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface SlotCardProps {
  slot: TimeSlot;
  darkMode: boolean;
  onOnlineBook: (slot: TimeSlot) => void;
  onCashBook: (slot: TimeSlot, e: React.MouseEvent) => void;
}

export function SlotCard({ slot, darkMode, onOnlineBook, onCashBook }: SlotCardProps) {
  const { lang, t } = useLanguage();

  const isBooked = slot.status === 'BOOKED';
  const isLocked = slot.status === 'LOCKED_PENDING';

  const formatHour = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const availableBg = darkMode
    ? 'bg-slate-900 border-slate-800 text-white hover:border-lime-400'
    : 'bg-white border-gray-200 text-slate-900 hover:border-lime-500 shadow-sm';

  const bookedBg = darkMode
    ? 'bg-slate-900/40 border-rose-950 text-slate-500 opacity-60'
    : 'bg-red-50/60 border-red-200 text-red-700 opacity-70';

  const lockedBg = darkMode
    ? 'bg-amber-950/20 border-amber-800/50 text-amber-300'
    : 'bg-amber-50 border-amber-200 text-amber-800';

  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
        isBooked ? bookedBg : isLocked ? lockedBg : availableBg
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-400">
            {formatHour(slot.startTime)}
          </span>
          {isBooked ? (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 border border-rose-200 text-rose-700">
              {t('booked')}
            </span>
          ) : isLocked ? (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800">
              {t('pending')}
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800">
              {t('available')}
            </span>
          )}
        </div>

        <div className="my-3">
          <span className="text-2xl font-black tracking-tight text-lime-600 inline-block">
            {slot.priceSar}
          </span>
          <span className="text-xs font-bold text-slate-400 ml-1">SAR</span>
        </div>
      </div>

      {slot.isAvailable && (
        <div className="space-y-2 pt-2 border-t border-gray-200/60">
          <button
            onClick={() => onOnlineBook(slot)}
            className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs py-2 px-3 rounded-xl transition active:scale-95 shadow-[0_0_15px_rgba(163,230,53,0.2)] uppercase"
          >
            {t('payOnline')}
          </button>
          <button
            onClick={(e) => onCashBook(slot, e)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] py-1.5 px-2 rounded-lg transition"
          >
            {t('deskCash')}
          </button>
        </div>
      )}
    </div>
  );
}