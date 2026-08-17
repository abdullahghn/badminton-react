// src/components/calendar/CourtSection.tsx
'use client';

import { TimeSlot } from '@/types';
import { SlotCard } from './SlotCard';

interface CourtSectionProps {
  courtName: string;
  slots: TimeSlot[];
  darkMode: boolean;
  onOnlineBook: (slot: TimeSlot) => void;
  onCashBook: (slot: TimeSlot, e: React.MouseEvent) => void;
}

export function CourtSection({
  courtName,
  slots,
  darkMode,
  onOnlineBook,
  onCashBook,
}: CourtSectionProps) {
  return (
    <section
      className={`border rounded-3xl p-6 shadow-sm transition-colors ${
        darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/60">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-lime-500 shadow-sm" />
          <h2 className={`text-xl font-black uppercase tracking-wide ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {courtName}
          </h2>
        </div>
        <span
          className={`text-xs font-black px-3 py-1 rounded-full border ${
            darkMode
              ? 'text-slate-400 bg-slate-950 border-slate-800'
              : 'text-slate-600 bg-gray-100 border-gray-200'
          }`}
        >
          {slots.length} SLOTS
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {slots.map((slot, index) => (
          <SlotCard
            key={index}
            slot={slot}
            darkMode={darkMode}
            onOnlineBook={onOnlineBook}
            onCashBook={onCashBook}
          />
        ))}
      </div>
    </section>
  );
}