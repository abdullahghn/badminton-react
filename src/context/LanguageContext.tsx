// src/context/LanguageContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  lang: Language;
  dir: 'ltr' | 'rtl';
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  headerTitle: { en: 'Badminton Court Booking', ar: 'منصة حجز ملاعب الريشة' },
  headerSub: { en: 'Jeddah Premier Indoor Courts', ar: 'أفضل الملاعب المغلقة في جدة' },
  selectDate: { en: 'Select Date', ar: 'اختر التاريخ' },
  payOnline: { en: 'Book Online', ar: 'دفع إلكتروني' },
  deskCash: { en: 'Desk Cash', ar: 'دفع نقدي / شبكة' },
  available: { en: 'Available', ar: 'متاح' },
  booked: { en: 'Booked', ar: 'محجوز' },
  pending: { en: 'Hold Pending', ar: 'قيد الانتظار' },
  walkInTitle: { en: 'New Walk-in Cash Booking', ar: 'حجز حضوري جديد' },
  customerName: { en: 'Customer Name', ar: 'اسم العميل' },
  phone: { en: 'Phone Number', ar: 'رقم الجوال' },
  paymentMethod: { en: 'Payment Method', ar: 'طريقة الدفع' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  confirm: { en: 'Confirm Booking', ar: 'تأكيد الحجز' },
  cashAtDesk: { en: 'Cash at Desk', ar: 'نقداً في الاستقبال' },
  posTerminal: { en: 'Card via Desk POS', ar: 'بطاقة عبر جهاز النقاط' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // SET DEFAULT TO ENGLISH
  const [lang, setLang] = useState<Language>('en');

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, toggleLanguage, t }}>
      <div dir={dir} className="font-sans">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}