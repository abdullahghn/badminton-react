// src/app/admin/pricing/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface PricingRule {
  id: string;
  name: string;
  dayType: 'WEEKDAY' | 'WEEKEND' | 'ALL';
  startHour: number;
  endHour: number;
  ratePerHour: string | number;
  isPeak: boolean;
  isActive: boolean;
}

export default function PricingRulesPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Rule Form State
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [dayType, setDayType] = useState<'WEEKDAY' | 'WEEKEND' | 'ALL'>('WEEKDAY');
  const [startHour, setStartHour] = useState(17);
  const [endHour, setEndHour] = useState(23);
  const [ratePerHour, setRatePerHour] = useState(100);
  const [isPeak, setIsPeak] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pricing');
      const data = await res.json();
      if (data.success) setRules(data.data);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dayType, startHour, endHour, ratePerHour, isPeak }),
      });
      if (res.ok) {
        setShowForm(false);
        setName('');
        fetchRules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const formatted = hour % 12 || 12;
    return `${formatted}:00 ${period}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Court Pricing & Surge Manager</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure automated hourly rates (SAR) for off-peak, weekends, and evening surge hours
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm"
        >
          <span>{showForm ? '✕ Cancel' : '➕ Add Pricing Rule'}</span>
        </button>
      </div>

      {/* NEW RULE MODAL / FORM */}
      {showForm && (
        <form onSubmit={handleCreateRule} className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-400">Create Dynamic Pricing Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
            <div>
              <label className="block mb-1 text-slate-400">Rule Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Weekend Night Prime"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-400">Day Schedule</label>
              <select
                value={dayType}
                onChange={(e) => setDayType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="WEEKDAY">Weekdays Only (Sun-Thu)</option>
                <option value="WEEKEND">Weekends Only (Fri-Sat)</option>
                <option value="ALL">All Days</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-slate-400">Rate per Hour (SAR)</label>
              <input
                type="number"
                required
                min="1"
                value={ratePerHour}
                onChange={(e) => setRatePerHour(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-400">Start Time</label>
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i}>{formatTime(i)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-slate-400">End Time</label>
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i}>{formatTime(i)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isPeak"
                checked={isPeak}
                onChange={(e) => setIsPeak(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
              <label htmlFor="isPeak" className="text-slate-300 cursor-pointer">Tag as Peak / Prime Hour</label>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs rounded-xl transition"
          >
            Save Pricing Rule
          </button>
        </form>
      )}

      {/* RULES LIST GRID */}
      {loading ? (
        <div className="p-12 text-center text-xs font-black uppercase text-slate-400 tracking-wider">
          Loading Pricing Rules...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition shadow-sm space-y-4 bg-white ${
                rule.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider mb-1 ${
                    rule.isPeak ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {rule.isPeak ? '🔥 Prime Surge' : '⚡ Off-Peak'}
                  </span>
                  <h3 className="font-black text-slate-900 text-base">{rule.name}</h3>
                </div>

                <button
                  onClick={() => handleToggleActive(rule.id, rule.isActive)}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition ${
                    rule.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {rule.isActive ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="flex items-baseline gap-1 border-t border-b border-gray-100 py-3">
                <span className="text-2xl font-black text-slate-900">{Number(rule.ratePerHour).toFixed(0)}</span>
                <span className="text-xs font-bold text-slate-400">SAR / Hour</span>
              </div>

              <div className="text-xs font-bold text-slate-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span>📅 Schedule:</span>
                  <span className="text-slate-900">{rule.dayType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏰ Hours:</span>
                  <span className="text-indigo-600">{formatTime(rule.startHour)} - {formatTime(rule.endHour)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}