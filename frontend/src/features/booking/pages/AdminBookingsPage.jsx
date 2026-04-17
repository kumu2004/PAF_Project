import React, { useState } from 'react';
import { BookingCard } from '../components/BookingCard';
import { RejectModal } from '../components/RejectModal';
import { useBookings } from '../hooks/useBookings';
import {
  Loader, CalendarDays, CheckCircle2, Clock, XCircle,
  LayoutList, ShieldCheck, RefreshCw, Users, Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * AdminBookingsPage Component
 * Admin dashboard for managing all bookings
 */
export const AdminBookingsPage = () => {
  const {
    allBookings,
    approveBooking,
    rejectBooking,
    isApproving,
    isRejecting,
  } = useBookings();

  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [rejectModal, setRejectModal] = useState({ isOpen: false, bookingId: null });

  React.useEffect(() => {
    allBookings.refetch();
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, itemsPerPage]);

  const handleApprove = async (bookingId) => {
    if (!window.confirm('Approve this booking?')) return;
    try {
      await approveBooking(bookingId);
    } catch (error) {
      console.error('Approve failed:', error);
    }
  };

  const handleRejectClick = (bookingId) => {
    setRejectModal({ isOpen: true, bookingId });
  };

  const handleRejectSubmit = async (bookingId, reason) => {
    try {
      await rejectBooking({ id: bookingId, reason });
      setRejectModal({ isOpen: false, bookingId: null });
    } catch (error) {
      console.error('Reject failed:', error);
    }
  };

  const filteredBookings = allBookings.data?.filter((booking) => {
    // 1. Status Filter
    if (filterStatus !== 'ALL' && booking.status !== filterStatus) return false;
    
    // 2. Search Query Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchesPurpose = booking.purpose?.toLowerCase().includes(q);
      const matchesResource = booking.resourceId?.toLowerCase().includes(q);
      const matchesName = booking.createdByName?.toLowerCase().includes(q);
      const matchesEmail = booking.createdByEmail?.toLowerCase().includes(q);
      
      if (!matchesPurpose && !matchesResource && !matchesName && !matchesEmail) {
        return false;
      }
    }
    
    return true;
  }) || [];

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const statusCounts = {
    ALL: allBookings.data?.length || 0,
    PENDING: allBookings.data?.filter((b) => b.status === 'PENDING').length || 0,
    APPROVED: allBookings.data?.filter((b) => b.status === 'APPROVED').length || 0,
    REJECTED: allBookings.data?.filter((b) => b.status === 'REJECTED').length || 0,
  };

  const filterConfig = [
    { label: 'All',      key: 'ALL',      icon: LayoutList },
    { label: 'Pending',  key: 'PENDING',  icon: Clock },
    { label: 'Approved', key: 'APPROVED', icon: CheckCircle2 },
    { label: 'Rejected', key: 'REJECTED', icon: XCircle },
  ];

  const statCards = [
    { label: 'Total',    count: statusCounts.ALL,      color: '#3b82f6', filterKey: 'ALL',      icon: Users },
    { label: 'Pending',  count: statusCounts.PENDING,  color: '#f47920', filterKey: 'PENDING',  icon: Clock },
    { label: 'Approved', count: statusCounts.APPROVED, color: '#10b981', filterKey: 'APPROVED', icon: CheckCircle2 },
    { label: 'Rejected', count: statusCounts.REJECTED, color: '#ef4444', filterKey: 'REJECTED', icon: XCircle },
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
              <ShieldCheck className="w-3 h-3" />
              Admin Panel
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Booking{' '}
              <span style={{ color: '#f47920' }}>Management</span>
            </h1>
            <p className="text-slate-400 text-base mt-3 max-w-lg">
              Review, approve, and manage all campus resource booking requests.
            </p>
          </div>

          {/* Right — refresh + total count */}
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <button
              onClick={() => allBookings.refetch()}
              disabled={allBookings.isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
              style={{ background: '#f47920', color: '#182c51' }}
            >
              <RefreshCw className={`w-4 h-4 ${allBookings.isLoading ? 'animate-spin' : ''}`} />
              {allBookings.isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
            >
              <CalendarDays className="w-4 h-4" style={{ color: '#f47920' }} />
              {statusCounts.ALL} total booking{statusCounts.ALL !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, count, color, filterKey, icon: Icon }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 + 0.15 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all"
            onClick={() => setFilterStatus(filterKey)}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}12` }}
            >
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-black" style={{ color: '#182c51' }}>{count}</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Filter Tabs */}
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

        {/* Search Bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#f47920] focus:border-transparent transition-all"
            style={{ color: '#182c51' }}
          />
        </div>
      </div>

      {/* ── Bookings Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBookings.isLoading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <Loader className="w-8 h-8 animate-spin" style={{ color: '#f47920' }} />
          </div>
        ) : filteredBookings.length > 0 ? (
          paginatedBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isAdmin={true}
              onApproveClick={handleApprove}
              onRejectClick={handleRejectClick}
            />
          ))
        ) : (
          <div
            className="col-span-full text-center py-16 rounded-2xl border border-dashed"
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
              {filterStatus === 'PENDING'
                ? 'All pending requests have been handled.'
                : 'Try selecting a different filter above.'}
            </p>
          </div>
        )}
      </div>

      {/* ── Pagination Controls ── */}
      {filteredBookings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mt-2">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[#182c51] font-bold focus:outline-none focus:ring-2 focus:ring-[#f47920] transition-all"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={filteredBookings.length > 0 ? filteredBookings.length : 100}>All</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold px-2 text-[#182c51]">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <RejectModal
        isOpen={rejectModal.isOpen}
        bookingId={rejectModal.bookingId}
        onReject={handleRejectSubmit}
        onCancel={() => setRejectModal({ isOpen: false, bookingId: null })}
        isLoading={isRejecting}
      />
    </div>
  );
};
