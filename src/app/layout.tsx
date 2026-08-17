// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Badminton Court Booking | Jeddah',
  description: 'Book indoor badminton courts instantly in Jeddah',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}