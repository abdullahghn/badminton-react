// src/app/admin/courts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Court {
  id: string;
  name: string;
  surfaceType?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCourtName, setNewCourtName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCourts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/courts');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success && data.data) {
        setCourts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch courts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourtName.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCourtName }),
      });

      const data = await res.json();
      if (data.success) {
        setNewCourtName('');
        setMessage({ type: 'success', text: 'New court added successfully!' });
        fetchCourts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add court' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/courts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      const data = await res.json();
      if (data.success) {
        fetchCourts();
      } else {
        alert(data.error || 'Failed to update court status');
      }
    } catch {
      alert('Error updating court status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* TOP NAVIGATION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Court Facility Management</h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Add new courts or toggle active/maintenance status
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/bookings"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              📋 Bookings Ledger
            </Link>
            <Link
              href="/calendar"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
            >
              🏸 Calendar View
            </Link>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-bold border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ADD NEW COURT CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">Add New Court</h2>
          <form onSubmit={handleAddCourt} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
              placeholder="e.g. Court 2 (VIP Indoor)"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs uppercase transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Adding...' : '+ Add Court'}
            </button>
          </form>
        </div>

        {/* COURTS LIST */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">Existing Courts ({courts.length})</h2>

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-400 font-bold uppercase">
              Loading court inventory...
            </div>
          ) : courts.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400 font-bold">
              No courts created yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {courts.map((court) => (
                <div key={court.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{court.name}</h3>
                    <p className="text-[11px] text-gray-400 font-medium">
                      Status: {court.isActive ? 'Available for bookings' : 'Under maintenance'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        court.isActive
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      {court.isActive ? '● Active' : '○ Maintenance'}
                    </span>

                    <button
                      onClick={() => handleToggleActive(court.id, court.isActive)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                        court.isActive
                          ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                      }`}
                    >
                      {court.isActive ? 'Set Inactive' : 'Activate Court'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}