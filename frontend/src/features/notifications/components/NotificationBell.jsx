import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CalendarCheck, CalendarX, CalendarDays, Ticket, Check, X, ChevronDown, RefreshCw } from 'lucide-react';

const TYPE_STYLES = {
  TICKET_ASSIGNED: {
    icon: Ticket,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
  },
  BOOKING_APPROVED: {
    icon: CalendarCheck,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
  },
  BOOKING_REJECTED: {
    icon: CalendarX,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-100',
  },
  NEW_BOOKING_REQUEST: {
    icon: CalendarDays,
    iconColor: 'text-[#182c51]',
    iconBg: 'bg-blue-100',
  },
  ADMIN_USER_MGMT: {
    icon: Bell,
    iconColor: 'text-[#f47920]',
    iconBg: 'bg-orange-50',
  }
};
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '../../../store/authStore';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  fetchUnreadCount,
  fetchAllNotifications,
  markNotificationRead,
} from '../services/notificationService';

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Math.max(0, Date.now() - d.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('All');

  const isAdmin = user?.role === 'ADMIN';

  const basePath = useMemo(() => {
    if (isAdmin) return '/admin/notifications';
    return '/notifications';
  }, [isAdmin]);

  const unreadCountQ = useQuery({
    queryKey: ['notifications', 'unreadCount', isAdmin],
    queryFn: () => fetchUnreadCount({ isAdmin }),
    refetchInterval: 30000,
  });

  const recentItemsQ = useQuery({
    queryKey: ['notifications', 'recentList', isAdmin],
    queryFn: () => fetchAllNotifications({ isAdmin, limit: 10 }),
    enabled: open,
  });

  const count = Number(unreadCountQ.data || 0);
  const items = recentItemsQ.data || [];

  const filteredItems = useMemo(() => {
    return items.filter(n => {
      if (filter === 'All') return true;
      if (filter === 'Unread') return !n.readAt;
      if (filter === 'Bookings') return n.type.includes('BOOKING');
      if (filter === 'Tickets') return n.type.includes('TICKET');
      if (filter === 'Account') return n.type.includes('USER');
      return true;
    });
  }, [items, filter]);

  const handleClickItem = async (n) => {
    try {
      await markNotificationRead(n.id);
      qc.invalidateQueries({ queryKey: ['notifications'] });
    } finally {
      setOpen(false);
      navigate(n.actionPath || basePath);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="relative rounded-xl p-2 hover:bg-slate-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#f47920]"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-[#182c51]" />
            {count > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] font-black text-white flex items-center justify-center"
                style={{ background: '#f47920' }}
              >
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        }
      />

      <DropdownMenuContent
        align="end"
        className="w-[420px] bg-white rounded-2xl shadow-xl border-slate-100 p-0 overflow-hidden"
      >
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[15px] font-bold text-[#182c51] leading-none">Notifications</p>
              <p className="text-[12px] text-blue-600 font-medium mt-1">
                {count > 0 ? `${count} unread` : 'All caught up'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                className="text-[12px] font-medium text-blue-600 hover:underline"
              >
                Mark all read
              </button>
              <button 
                className="text-[12px] font-medium text-red-500 hover:underline"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-slate-100 mt-3 pt-1 overflow-x-auto scrollbar-none px-4 -mx-4">
            {['All', 'Unread', 'Bookings', 'Tickets', 'Account'].map((tab) => (
              <button
                key={tab}
                onClick={(e) => {
                  e.stopPropagation();
                  setFilter(tab);
                }}
                className={`text-[13px] whitespace-nowrap pb-2 flex items-center gap-1.5 transition-colors border-b-2 first:ml-4 last:mr-4 ${
                  filter === tab
                    ? "border-yellow-400 text-blue-600 font-bold"
                    : "border-transparent text-slate-500 font-medium hover:text-[#182c51]"
                }`}
              >
                {tab}
                {tab === 'Unread' && count > 0 && (
                  <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {recentItemsQ.isLoading ? (
          <div className="px-4 py-8 text-sm text-slate-400 text-center">Loading…</div>
        ) : filteredItems.length === 0 ? (
          <div className="px-4 py-8 text-sm text-slate-400 text-center">No notifications found.</div>
        ) : (
          <div className="max-h-[380px] overflow-auto scrollbar-thin scrollbar-thumb-slate-200">
            {filteredItems.map((n) => {
              const style = TYPE_STYLES[n.type] || TYPE_STYLES.ADMIN_USER_MGMT;
              const Icon = style.icon;
              const isUnread = !n.readAt;
              return (
              <div
                key={n.id}
                className="relative group border-l-4 border-transparent hover:bg-slate-50 transition-colors"
                style={{ borderLeftColor: isUnread ? '#facc15' : 'transparent' }}
              >
                <div 
                  className="flex items-start gap-3 p-3 cursor-pointer pl-4"
                  onClick={() => handleClickItem(n)}
                >
                  <div
                    className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.iconBg}`}
                  >
                    <Icon className={`w-4 h-4 ${style.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-[#182c51] truncate">{n.title}</p>
                    <p className="text-[12px] text-slate-600 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${style.iconBg} ${style.iconColor}`}>
                        {n.type.split('_')[0].charAt(0) + n.type.split('_')[0].slice(1).toLowerCase()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons (Mark read / dismiss) */}
                  <div className="flex flex-col gap-1.5 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button className="w-6 h-6 rounded flex items-center justify-center bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors" title="Mark as Read">
                      <Check className="w-3 h-3" />
                    </button>
                    <button className="w-6 h-6 rounded flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Dismiss">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        {/* Footer with See More arrow */}
        <div className="flex items-center justify-center py-2 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              setOpen(false);
              navigate(basePath);
            }}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-[#182c51] transition-colors"
            title="See more notifications"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}