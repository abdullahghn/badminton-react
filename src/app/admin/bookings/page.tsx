// src/app/admin/bookings/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import WalkInBookingModal from '@/components/WalkInBookingModal';

interface BookingRecord {
  id: string;
  guestName: string | null;
  guestPhone: string | null;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'PENDING_PAYMENT' | 'CANCELLED' | 'EXPIRED';
  paymentMethod: string;
  totalPriceSar: number | string;
  paymentRef: string | null;
  createdAt: string;
  court: { name: string };
  user: { name: string; phone: string; email: string | null } | null;
}

type SortField = 'id' | 'customer' | 'court' | 'startTime' | 'totalPriceSar' | 'status';
type SortOrder = 'asc' | 'desc';

export default function BookingsLedgerPage() {
  const [data, setData] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'CONFIRMED' | 'PENDING_PAYMENT' | 'CANCELLED'>('ALL');
  
  // Walk-In Modal State
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  // Sorting & Pagination state
  const [sortField, setSortField] = useState<SortField>('startTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings?status=${activeTab}&search=${encodeURIComponent(globalFilter)}`);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const result = await res.json();
        if (result.success && result.data) {
          setData(result.data);
          setCurrentPage(1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, globalFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const resData = await res.json();
      if (resData.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    if (!data.length) return;

    const headers = ['Booking ID', 'Customer Name', 'Phone', 'Court', 'Start Time', 'End Time', 'Price (SAR)', 'Payment Method', 'Status', 'Ref ID'];
    const rows = data.map((b) => [
      b.id.substring(0, 8),
      b.user?.name || b.guestName || 'Guest',
      b.user?.phone || b.guestPhone || '-',
      b.court.name,
      new Date(b.startTime).toLocaleString(),
      new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      b.totalPriceSar,
      b.paymentMethod,
      b.status,
      b.paymentRef || '-',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((field) => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reservations_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sorted Data Computation
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal: any = a[sortField as keyof BookingRecord];
      let bVal: any = b[sortField as keyof BookingRecord];

      if (sortField === 'customer') {
        aVal = a.user?.name || a.guestName || '';
        bVal = b.user?.name || b.guestName || '';
      } else if (sortField === 'court') {
        aVal = a.court?.name || '';
        bVal = b.court?.name || '';
      } else if (sortField === 'startTime') {
        aVal = new Date(a.startTime).getTime();
        bVal = new Date(b.startTime).getTime();
      } else if (sortField === 'totalPriceSar') {
        aVal = Number(a.totalPriceSar);
        bVal = Number(b.totalPriceSar);
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortOrder]);

  // Pagination Computation
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reservations & Bookings Ledger</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time court bookings grid with instant global search and accounting exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWalkInOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
          >
            <span>⚡</span> New Walk-In Booking
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!data.length}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <span>📥</span> Export CSV Ledger
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {(['ALL', 'CONFIRMED', 'PENDING_PAYMENT', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'All Bookings' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by customer, phone, ID, court..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
          />
          <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-black uppercase text-slate-400 tracking-wider">
            Loading Reservations Data Grid...
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-3xl">📋</div>
            <div className="text-sm font-extrabold text-slate-700">No Reservations Found</div>
            <div className="text-xs text-slate-400">Try adjusting your status filter or search query.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('id')}>
                    ID {sortField === 'id' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('customer')}>
                    Customer Details {sortField === 'customer' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('court')}>
                    Court {sortField === 'court' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('startTime')}>
                    Schedule {sortField === 'startTime' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('totalPriceSar')}>
                    Amount {sortField === 'totalPriceSar' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                  <th className="p-4 cursor-pointer select-none" onClick={() => handleSort('status')}>
                    Status {sortField === 'status' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                  <th className="p-4">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((b) => {
                  const name = b.user?.name || b.guestName || 'Walk-in Player';
                  const phone = b.user?.phone || b.guestPhone || 'No Phone';
                  const start = new Date(b.startTime);
                  const end = new Date(b.endTime);

                  const statusStyles: Record<string, string> = {
                    CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    PENDING_PAYMENT: 'bg-amber-100 text-amber-800 border-amber-200',
                    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
                    EXPIRED: 'bg-slate-100 text-slate-600 border-slate-200',
                  };

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 align-middle">
                        <span className="font-mono text-[11px] font-bold text-slate-500">
                          #{b.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{phone}</div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-black">
                          🏸 {b.court.name}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                          </div>
                          <div className="text-[10px] text-indigo-600 font-mono font-bold">
                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div>
                          <div className="font-black text-xs text-slate-900">
                            {Number(b.totalPriceSar).toFixed(2)} SAR
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold">
                            {b.paymentMethod.replace('ONLINE_', '')}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`px-2.5 py-1 border text-[10px] font-black rounded-full uppercase tracking-wider ${
                            statusStyles[b.status] || statusStyles.EXPIRED
                          }`}
                        >
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          {b.status === 'CONFIRMED' && (
                            <button
                              onClick={() => updateStatus(b.id, 'CANCELLED')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-extrabold transition"
                            >
                              Cancel
                            </button>
                          )}
                          {b.status === 'PENDING_PAYMENT' && (
                            <button
                              onClick={() => updateStatus(b.id, 'CONFIRMED')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-extrabold transition"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {data.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-slate-500">
            <div>
              Showing Page {currentPage} of {totalPages} ({sortedData.length} records)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-slate-700 disabled:opacity-40 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-slate-700 disabled:opacity-40 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* WALK-IN QUICK BOOKING MODAL */}
      <WalkInBookingModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        onSuccess={fetchBookings}
      />
    </div>
  );
}