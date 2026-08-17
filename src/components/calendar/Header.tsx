// src/components/calendar/Header.tsx
'use client';

import { useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderProps {
  selectedDate: string;
  darkMode: boolean;
  onDateChange: (date: string) => void;
  onToggleDarkMode: () => void;
}

export function Header({
  selectedDate,
  darkMode,
  onDateChange,
  onToggleDarkMode,
}: HeaderProps) {
  const { lang, toggleLanguage, t } = useLanguage();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateContainerClick = () => {
    if (dateInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <header
      className={`border-b sticky top-0 z-30 shadow-md transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* LOGO & TITLE */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-lime-500 to-emerald-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(163,230,53,0.3)]">
            🏸
          </div>
          <div>
            <h1
              className={`text-xl sm:text-2xl font-black tracking-tight uppercase italic ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              {t('headerTitle')}
            </h1>
            <p className="text-xs text-lime-600 font-extrabold tracking-wider uppercase">
              {t('headerSub')}
            </p>
          </div>
        </div>

        {/* HEADER CONTROLS */}
        <div className="flex items-center gap-3">
          {/* DARK / LIGHT MODE TOGGLE */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base transition ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-gray-100 border-gray-200 text-slate-800 hover:bg-gray-200'
            }`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* LANGUAGE TOGGLE (REACT-SAFE SVG FLAGS) */}
          <button
            onClick={toggleLanguage}
            title={lang === 'en' ? 'تغيير إلى العربية' : 'Switch to English'}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition overflow-hidden p-2 ${
              darkMode
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {lang === 'en' ? (
              /* SAUDI ARABIA FLAG SVG */
              <svg className="w-6 h-4 rounded-sm shadow-sm" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
                <rect width="900" height="600" fill="#006C35"/>
                <path d="M280,360 h340 v20 h-340 z M600,370 l20,-10 l-10,25 z" fill="#FFF"/>
                <text x="450" y="300" fontFamily="Arial" fontWeight="bold" fontSize="80" fill="#FFF" textAnchor="middle">لا إله إلا الله</text>
              </svg>
            ) : (
              /* USA FLAG SVG */
              <svg className="w-6 h-4 rounded-sm shadow-sm" viewBox="0 0 741 390" xmlns="http://www.w3.org/2000/svg">
                <rect width="741" height="390" fill="#B22234"/>
                <path d="M0,30H741M0,90H741M0,150H741M0,210H741M0,270H741M0,330H741" stroke="#FFF" strokeWidth="30"/>
                <rect width="296.4" height="210" fill="#3C3B6E"/>
              </svg>
            )}
          </button>

          {/* FULLY CLICKABLE DATE SELECTOR */}
          <div
            onClick={handleDateContainerClick}
            className={`border rounded-xl px-3 py-2 flex items-center gap-2 cursor-pointer transition ${
              darkMode
                ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-xs font-black text-gray-400 uppercase select-none">
              {t('selectDate')}:
            </span>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className={`text-xs font-black rounded-lg bg-transparent cursor-pointer focus:outline-none ${
                darkMode ? 'text-lime-400' : 'text-slate-900'
              }`}
            />
          </div>
        </div>
      </div>
    </header>
  );
}