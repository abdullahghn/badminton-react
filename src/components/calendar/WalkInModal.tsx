// src/components/calendar/WalkInModal.tsx
'use client';

import { TimeSlot } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface WalkInModalProps {
  selectedSlot: TimeSlot | null;
  guestName: string;
  guestPhone: string;
  paymentMethod: 'CASH' | 'POS_TERMINAL';
  submitting: boolean;
  modalError: string | null;
  onClose: () => void;
  onNameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onPaymentMethodChange: (val: 'CASH' | 'POS_TERMINAL') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function WalkInModal({
  selectedSlot,
  guestName,
  guestPhone,
  paymentMethod,
  submitting,
  modalError,
  onClose,
  onNameChange,
  onPhoneChange,
  onPaymentMethodChange,
  onSubmit,
}: WalkInModalProps) {
  const { lang, t } = useLanguage();

  if (!selectedSlot) return null;

  const formatHour = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6">
        <div>
          <h3 className="text-xl font-black text-white uppercase italic">{t('walkInTitle')}</h3>
          <p className="text-xs font-bold text-lime-400 mt-1">
            {selectedSlot.courtName} • {formatHour(selectedSlot.startTime)} ({selectedSlot.priceSar} SAR)
          </p>
        </div>

        {modalError && (
          <div className="p-3 text-xs bg-rose-950 border border-rose-800 text-rose-300 rounded-xl font-bold">
            {modalError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1">
              {t('customerName')}
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Ahmed Al-Ghamdi"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1">
              {t('phone')}
            </label>
            <input
              type="tel"
              required
              value={guestPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="e.g. 0501234567"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1">
              {t('paymentMethod')}
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value as 'CASH' | 'POS_TERMINAL')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-lime-400"
            >
              <option value="CASH">{t('cashAtDesk')}</option>
              <option value="POS_TERMINAL">{t('posTerminal')}</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs uppercase transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black py-3 rounded-xl text-xs uppercase transition disabled:opacity-50"
            >
              {submitting ? '...' : t('confirm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}