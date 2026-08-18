// src/app/admin/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  // 1. ALL HOOKS MUST BE DECLARED UNCONDITIONALLY AT THE TOP
  useEffect(() => {
    // Skip fetching session if on the login page
    if (pathname === '/admin/login') return;

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data && data.success && data.data) {
          setUser(data.data);
        }
      })
      .catch((err) => console.error('Auth check error:', err));
  }, [pathname]);

  // 2. EARLY RETURNS MUST COME AFTER ALL HOOKS
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.refresh(); // Clears Next.js router client cache
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Executive Dashboard', icon: '📊' },
    { href: '/admin/bookings', label: 'Bookings Ledger', icon: '📋' },
    { href: '/admin/courts', label: 'Facility & Courts', icon: '🏸' },
    { href: '/calendar', label: 'Public Calendar', icon: '🗓️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col justify-between border-r border-slate-800">
        <div className="p-6 space-y-8">
          {/* BRAND */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-400 text-slate-950 font-black rounded-xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(163,230,53,0.3)]">
              🏸
            </div>
            <div>
              <h2 className="font-black text-sm uppercase italic tracking-tight">Court Admin</h2>
              <p className="text-[10px] text-lime-400 font-bold uppercase tracking-wider">Jeddah Venue</p>
            </div>
          </div>

          {/* NAV LINKS */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-extrabold transition ${
                    isActive
                      ? 'bg-lime-400 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* USER PROFILE & LOGOUT */}
        <div className="p-4 m-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-800 text-lime-400 font-black rounded-xl flex items-center justify-center text-sm border border-slate-700">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate">{user?.name || 'Staff User'}</p>
              <p className="text-[10px] font-mono text-slate-400 truncate">{user?.role || 'DESK_STAFF'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700 text-[11px] font-bold py-2 rounded-xl transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}