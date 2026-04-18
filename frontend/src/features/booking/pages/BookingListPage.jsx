import React, { useState } from 'react';
import { BookingCard } from '../components/BookingCard';
import { useBookings } from '../hooks/useBookings';
import { Loader, CalendarDays, CheckCircle2, Clock, XCircle, LayoutList } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * BookingListPage Component
 * User's booking list and creation interface
 */
export const BookingListPage = () => {
  const { myBookings } = useBookings();
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredBookings = myBookings.data?.filter((booking) => {
    if (filterStatus === 'ALL') return true;
    return booking.status === filterStatus;
  }) || [];

  const statusCounts = {
    ALL: myBookings.data?.length || 0,
    PENDING: myBookings.data?.filter((b) => b.status === 'PENDING').length || 0,
    APPROVED: myBookings.data?.filter((b) => b.status === 'APPROVED').length || 0,
    REJECTED: myBookings.data?.filter((b) => b.status === 'REJECTED').length || 0,
  };

  const filterConfig = [
    { label: 'All',      key: 'ALL',      icon: LayoutList },
    { label: 'Pending',  key: 'PENDING',  icon: Clock },
    { label: 'Approved', key: 'APPROVED', icon: CheckCircle2 },
    { label: 'Rejected', key: 'REJECTED', icon: XCircle },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">

      {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden"
        style={{ background: '#182c51' }}
      >
        {/* Decorative hex pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='none' stroke='%23f47920' stroke-width='1' stroke-opacity='0.15'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left — text */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border"
              style={{ background: 'rgba(244,121,32,0.1)', borderColor: 'rgba(244,121,32,0.3)', color: '#f47920' }}
            >
              <CalendarDays className="w-3 h-3" />
              Booking Manager
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              My{' '}
              <span style={{ color: '#f47920' }}>Bookings</span>
            </h1>
            <p className="text-slate-400 text-base mt-3 max-w-lg">
              Track, manage, and review all your resource reservation requests in one place.
            </p>
          </div>

          {/* Right — stat pill */}
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              <CalendarDays className="w-4 h-4" style={{ color: '#f47920' }} />
              {statusCounts.ALL} total booking{statusCounts.ALL !== 1 ? 's' : ''}
            </div>
            {/* Mini stats row */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Pending',  count: statusCounts.PENDING,  color: '#f47920' },
                { label: 'Approved', count: statusCounts.APPROVED, color: '#10b981' },
                { label: 'Rejected', count: statusCounts.REJECTED, color: '#ef4444' },
              ].map(({ label, count, color }) => (
                <span
                  key={label}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${color}18`, color }}
                >
                  {count} {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap gap-2">
        {filterConfig.map(({ label, key, icon: Icon }) => {
          const active = filterStatus === key;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all active:scale-95"
              style={
                active
                  ? { background: '#f47920', color: '#182c51' }
                  : { background: 'rgba(24,44,81,0.07)', color: '#182c51' }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span
                className="ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full"
                style={
                  active
                    ? { background: 'rgba(24,44,81,0.15)', color: '#182c51' }
                    : { background: 'rgba(244,121,32,0.12)', color: '#f47920' }
                }
              >
                {statusCounts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Bookings List ── */}
      <div className="space-y-4">
        {myBookings.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-8 h-8 animate-spin" style={{ color: '#f47920' }} />
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isAdmin={false}
            />
          ))
        ) : (
          <div
            className="text-center py-16 rounded-2xl border border-dashed"
            style={{ borderColor: 'rgba(24,44,81,0.15)', background: 'rgba(24,44,81,0.03)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(244,121,32,0.08)' }}
            >
              <CalendarDays className="w-7 h-7" style={{ color: '#f47920' }} />
            </div>
            <p className="font-semibold text-lg" style={{ color: '#182c51' }}>
              No {filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} bookings found
            </p>
            <p className="text-sm mt-1 text-slate-400">
              {filterStatus === 'ALL' ? 'Create your first booking to get started!' : 'Try selecting a different filter above.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
