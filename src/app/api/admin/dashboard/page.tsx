// src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AnalyticsPayload {
  kpis: {
    totalRevenueSar: number;
    onlineRevenueSar: number;
    cashRevenueSar: number;
    totalBookings: number;
    activeCourts: number;
    overallOccupancyRate: number;
  };
  revenueTrend: Array<{ date: string; online: number; cash: number; total: number }>;
  hourlyOccupancy: Array<{ hour: string; bookings: number; occupancyRate: number }>;
}

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setData(resData.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs font-black uppercase text-slate-400 tracking-widest">
        Generating Executive Analytics...
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Performance Overview</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Real-time revenue metrics, digital vs. cash breakdowns, and peak occupancy heatmaps
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            📋 Reservations Ledger
          </Link>
          <Link
            href="/admin/courts"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            🏸 Court Inventory
          </Link>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-sm space-y-2">
          <div className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
            Total Gross Revenue
          </div>
          <div className="text-3xl font-black text-lime-400">
            {kpis?.totalRevenueSar.toLocaleString()} <span className="text-sm font-bold text-white">SAR</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium pt-1">
            Online + Cash Desk Collections
          </div>
        </div>

        {/* Digital Payments */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
          <div className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">
            Online (Mada / Apple Pay)
          </div>
          <div className="text-3xl font-black text-slate-900">
            {kpis?.onlineRevenueSar.toLocaleString()} <span className="text-sm font-bold text-gray-500">SAR</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold pt-1">
            ● Automated Gateway Settled
          </div>
        </div>

        {/* Cash & POS */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
          <div className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">
            Cash & Desk POS
          </div>
          <div className="text-3xl font-black text-slate-900">
            {kpis?.cashRevenueSar.toLocaleString()} <span className="text-sm font-bold text-gray-500">SAR</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-bold pt-1">
            ● Front Desk Collected
          </div>
        </div>

        {/* Peak Occupancy */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2">
          <div className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">
            Facility Occupancy Rate
          </div>
          <div className="text-3xl font-black text-indigo-600">
            {kpis?.overallOccupancyRate}%
          </div>
          <div className="text-[10px] text-gray-400 font-medium pt-1">
            Across {kpis?.activeCourts} Active Courts
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* REVENUE TREND AREA CHART */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Daily Revenue Performance</h2>
            <p className="text-xs text-gray-400 font-medium">Comparison between Online vs Walk-in Cash streams</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueTrend || []}>
                <defs>
                  <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a3e635" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="online" name="Online (Mada)" stroke="#6366f1" fillOpacity={1} fill="url(#colorOnline)" />
                <Area type="monotone" dataKey="cash" name="Cash / POS" stroke="#84cc16" fillOpacity={1} fill="url(#colorCash)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HOURLY OCCUPANCY HEATMAP BAR CHART */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Peak Hour Usage Heatmap</h2>
            <p className="text-xs text-gray-400 font-medium">Court reservation density from 4:00 PM to Midnight</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.hourlyOccupancy || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94a3b8" unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="occupancyRate" name="Court Occupancy %" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}