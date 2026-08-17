// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/bookings');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-linear-to-tr from-lime-500 to-emerald-400 text-slate-950 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-[0_0_25px_rgba(163,230,53,0.3)]">
            🏸
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            Admin Management Portal
          </h1>
          <p className="text-xs font-bold text-slate-400">
            Jeddah Indoor Badminton Courts
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1">
              Staff Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@badminton.sa"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(163,230,53,0.2)] disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="text-center pt-2 text-[11px] text-slate-500 font-bold space-y-1">
          <div>Default Accounts (Password: <code className="text-slate-400">Admin@123</code>)</div>
          <div className="text-slate-400">
            <code>admin@badminton.sa</code> • <code>manager@badminton.sa</code> • <code>reception@badminton.sa</code>
          </div>
        </div>
      </div>
    </div>
  );
}