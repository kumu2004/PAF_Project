import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { cn } from '../lib/utils';
import { fetchAllNotifications, markNotificationRead } from '../features/notifications/services/notificationService';
import { Bell, CalendarCheck, CalendarX, CalendarDays, Ticket, Check, X, BellPlus, Calendar, MailOpen, Users } from 'lucide-react';

const TYPE_STYLES = {
  TICKET_ASSIGNED: { icon: Ticket, iconColor: 'text-orange-500', iconBg: 'bg-orange-100' },
  TICKET_UPDATED: { icon: Ticket, iconColor: 'text-orange-500', iconBg: 'bg-orange-100' },
  BOOKING_APPROVED: { icon: CalendarCheck, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-100' },
  BOOKING_REJECTED: { icon: CalendarX, iconColor: 'text-red-500', iconBg: 'bg-red-100' },
  NEW_BOOKING_REQUEST: { icon: CalendarDays, iconColor: 'text-[#182c51]', iconBg: 'bg-blue-100' },
  ADMIN_USER_MGMT: { icon: Bell, iconColor: 'text-[#f47920]', iconBg: 'bg-orange-50' }
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Math.max(0, Date.now() - d.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleString();
}

export default function NotificationsPage({ adminMode = false }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = adminMode || user?.role === 'ADMIN';

  const title = useMemo(() => (isAdmin ? 'User management notifications' : 'Notifications'), [isAdmin]);

  const [filter, setFilter] = useState('All');

  const notificationsQ = useQuery({
    queryKey: ['notifications', 'all', isAdmin],
    queryFn: () => fetchAllNotifications({ isAdmin, limit: 200 }),
    refetchInterval: 30000,
  });

  const items = notificationsQ.data || [];
  
  const unreadCount = items.filter(n => !n.readAt).length;

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

  const stats = {
    total: items.length,
    unread: unreadCount,
    bookings: items.filter(n => n.type.includes('BOOKING')).length,
    tickets: items.filter(n => n.type.includes('TICKET')).length,
    account: items.filter(n => n.type.includes('USER')).length,
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleNotificationClick = async (notification) => {
    await handleMarkRead(notification.id);
    if (notification.actionPath) {
      navigate(notification.actionPath);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1e3d 0%, #182c51 60%, #1a3460 100%)' }}
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        {/* Glows */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-7 sm:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-[0.22em] mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                {isAdmin ? 'Admin Notification Center' : 'Notification Center'}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                {title}
              </h1>
              <p className="text-white/55 text-sm max-w-lg leading-relaxed">
                {isAdmin ? 'Monitor updates related to user approvals and account activity.' : 'Stay up to date with your account updates and announcements.'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Strip ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Alerts',   value: stats.total,    icon: BellPlus,    cls: 'text-primary',         bg: 'bg-primary/10' },
          { label: 'Unread',         value: stats.unread,   icon: MailOpen,    cls: 'text-emerald-500',     bg: 'bg-emerald-500/10' },
          { label: 'Bookings',       value: stats.bookings, icon: Calendar,    cls: 'text-amber-500',       bg: 'bg-amber-500/10' },
          { label: 'Tickets',        value: stats.tickets,  icon: Ticket,      cls: 'text-rose-500',        bg: 'bg-rose-500/10' },
          { label: 'Account',        value: stats.account,  icon: Users,       cls: 'text-violet-500',      bg: 'bg-violet-500/10' },
        ].map((s) => (
          <Card key={s.label} className="border-border/50 overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${s.bg} group-hover:scale-110 transition-transform`}>
                <s.icon className={`w-5 h-5 ${s.cls}`} />
              </div>
              <div>
                <p className="text-2xl font-black leading-none">{notificationsQ.isLoading ? '—' : s.value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ── Notifications List ── */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm mt-6 overflow-hidden">
        {/* Tabs Bar */}
        <div className="flex items-center overflow-x-auto border-b border-slate-100 scrollbar-none px-4">
          {['All', 'Unread', 'Bookings', 'Tickets', 'Account'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-4 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2",
                filter === tab
                  ? "border-yellow-400 text-blue-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-[#182c51]"
              )}
            >
              {tab}
              {tab === 'Unread' && unreadCount > 0 && (
                <span className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-[10px] leading-none font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/30">
          <p className="text-sm font-bold text-[#182c51]">
            {filteredItems.length} {filter.toLowerCase()} notifications
          </p>
          <div className="flex gap-4">
            <button className="text-xs font-bold text-blue-600 hover:underline">Mark all read</button>
            <button className="text-xs font-bold text-red-500 hover:underline">Clear all</button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {notificationsQ.isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 py-16 text-sm text-slate-400 text-center font-medium">Loading notifications…</motion.div>
          ) : filteredItems.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 py-16 text-sm text-slate-400 text-center font-medium">No notifications found.</motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="divide-y divide-slate-100">
              {filteredItems.map((n, i) => {
                const unread = !n.readAt;
                const style = TYPE_STYLES[n.type] || TYPE_STYLES.ADMIN_USER_MGMT;
                const Icon = style.icon;

                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.015 }}
                    className={cn(
                      'group relative flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-4',
                      unread ? 'border-yellow-400 bg-yellow-50/10' : 'border-transparent bg-white'
                    )}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div
                      className={cn(
                        'mt-1 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        style.iconBg
                      )}
                    >
                      <Icon className={cn('w-5 h-5', style.iconColor)} />
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm font-bold text-[#182c51] truncate">
                          {n.title}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider', style.iconBg, style.iconColor)}>
                          {n.type.split('_')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors" 
                        title="Mark as Read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors" 
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

