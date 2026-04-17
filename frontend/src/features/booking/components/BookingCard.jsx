import React from 'react';
import { format } from 'date-fns';
import { Trash2, CheckCircle, XCircle, Clock, CalendarDays, Users, Timer } from 'lucide-react';
import { useBookings } from '../hooks/useBookings';

/**
 * BookingCard Component
 * Displays a single booking with action buttons — navy/orange brand theme
 */
export const BookingCard = ({
  booking,
  isAdmin = false,
  onApproveClick,
  onRejectClick,
}) => {
  const { cancelBooking, isCancelling } = useBookings();

  if (!booking) return null;

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(booking.id);
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  // Status config — colors + icons
  const statusConfig = {
    APPROVED: {
      bg: 'rgba(16,185,129,0.10)',
      border: 'rgba(16,185,129,0.25)',
      color: '#10b981',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    PENDING: {
      bg: 'rgba(244,121,32,0.10)',
      border: 'rgba(244,121,32,0.30)',
      color: '#f47920',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    REJECTED: {
      bg: 'rgba(239,68,68,0.10)',
      border: 'rgba(239,68,68,0.25)',
      color: '#ef4444',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    CANCELLED: {
      bg: 'rgba(100,116,139,0.10)',
      border: 'rgba(100,116,139,0.20)',
      color: '#64748b',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  };

  const status = statusConfig[booking.status] || statusConfig.CANCELLED;

  return (
    <div
      className="bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col"
      style={{ borderColor: 'rgba(24,44,81,0.08)' }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: status.color }} />

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header — title + status badge */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-extrabold text-base truncate"
              style={{ color: '#182c51' }}
            >
              {booking.purpose}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Resource: <span className="font-bold text-slate-500">{booking.resourceId}</span>
            </p>
            {isAdmin && (
              <p className="text-xs text-slate-400 mt-1">
                Requested by{' '}
                <span className="font-bold" style={{ color: '#182c51' }}>
                  {booking.createdByName || booking.createdByEmail || 'Unknown'}
                </span>
                {booking.createdByRole && (
                  <span
                    className="ml-1.5 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(24,44,81,0.07)', color: '#182c51' }}
                  >
                    {booking.createdByRole}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Status pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-black uppercase tracking-wide shrink-0"
            style={{ background: status.bg, borderColor: status.border, color: status.color }}
          >
            {status.icon}
            {booking.status}
          </div>
        </div>

        {/* Time / Attendees details */}
        <div
          className="rounded-xl p-3 space-y-2 text-xs"
          style={{ background: 'rgba(24,44,81,0.03)', border: '1px solid rgba(24,44,81,0.06)' }}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-slate-400">
              <CalendarDays className="w-3.5 h-3.5" style={{ color: '#f47920' }} />
              Start
            </span>
            <span className="font-bold" style={{ color: '#182c51' }}>
              {format(new Date(booking.startTime), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-slate-400">
              <Timer className="w-3.5 h-3.5" style={{ color: '#f47920' }} />
              End
            </span>
            <span className="font-bold" style={{ color: '#182c51' }}>
              {format(new Date(booking.endTime), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-slate-400">
              <Users className="w-3.5 h-3.5" style={{ color: '#f47920' }} />
              Attendees
            </span>
            <span className="font-bold" style={{ color: '#182c51' }}>
              {booking.expectedAttendees} people
            </span>
          </div>
          {booking.approvedAt && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: '#10b981' }}>
                <CheckCircle className="w-3.5 h-3.5" />
                Approved
              </span>
              <span className="font-bold" style={{ color: '#10b981' }}>
                {format(new Date(booking.approvedAt), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
          )}
          {booking.rejectionReason && (
            <div
              className="rounded-lg px-3 py-2 text-xs font-medium mt-1"
              style={{ background: 'rgba(239,68,68,0.07)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <span className="font-black">Reason: </span>
              {booking.rejectionReason}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          {/* Admin Actions */}
          {isAdmin && booking.status === 'PENDING' && (
            <>
              <button
                onClick={() => onApproveClick?.(booking.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 hover:opacity-90"
                style={{ background: '#10b981', color: 'white' }}
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => onRejectClick?.(booking.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 hover:opacity-90"
                style={{ background: '#ef4444', color: 'white' }}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </>
          )}

          {/* User cancel */}
          {!isAdmin && booking.status === 'APPROVED' && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'rgba(24,44,81,0.07)', color: '#182c51' }}
            >
              <Trash2 className="w-4 h-4" />
              {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}

          {/* No actions available */}
          {((isAdmin && booking.status !== 'PENDING') ||
            (!isAdmin && booking.status !== 'APPROVED')) && (
            <div
              className="flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold text-center"
              style={{ background: 'rgba(24,44,81,0.04)', color: '#94a3b8' }}
            >
              No Actions Available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
