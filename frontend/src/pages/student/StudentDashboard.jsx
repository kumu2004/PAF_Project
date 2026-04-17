import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SlaBadge } from '../../features/ticket/components/SlaBadge';
import { CalendarDays, Ticket, Plus, ArrowRight, Clock, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Fetch student's own bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/api/bookings/my').then((r) => toArray(r.data)),
  });

  // Fetch student's own tickets
  const { data: tickets = [] } = useQuery({
    queryKey: ['my-tickets'],
    queryFn:  () => api.get('/api/tickets/my').then((r) => r.data.data || []),
  });

  // Quick summary counts
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;
  const approvedBookings = bookings.filter((b) => b.status === 'APPROVED').length;
  const openTickets = tickets.filter((t) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length;

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'there';

  // Get time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning'
    : hour < 17 ? 'Good afternoon'
      : 'Good evening';

  return (
    <div className="space-y-8 pb-12">

      {/* Welcome header — Landing Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
        style={{ background: '#182c51' }}
      >
        {/* Subtle Decorative Background (matches landing hero) */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='none' stroke='%23f47920' stroke-width='1' stroke-opacity='0.15'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px'
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border"
              style={{ background: 'rgba(244,121,32,0.1)', borderColor: 'rgba(244,121,32,0.3)', color: '#f47920' }}>
              <GraduationCap className="w-3 h-3" />
              {user?.faculty || 'SLIIT Student'} {user?.academicYear ? `· ${user.academicYear}` : ''}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              {greeting}, <span style={{ color: '#f47920' }}>{firstName}!</span>
            </h1>
            <p className="text-slate-400 text-lg mt-4 max-w-xl">
              Manage your campus life and operations from one central, smart hub.
            </p>
          </div>

          <div className="flex gap-4 group">
            <Button
              size="lg"
              className="rounded-2xl font-bold h-14 px-8 shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
              onClick={() => navigate('/student/resources')}
              style={{ background: '#f47920', color: '#182c51' }}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Booking
            </Button>
            <Button
              size="lg"
              className="rounded-2xl font-bold h-14 px-8 shadow-xl shadow-orange-500/20 active:scale-95 transition-all text-white border-none"
              onClick={() => navigate('/tickets/new')}
              style={{ background: '#f47920' }}
            >
              <Ticket className="w-5 h-5 mr-2" />
              Report Issue
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick stat cards — Landing Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label: 'Pending bookings',
            value: pendingBookings,
            icon: Clock,
            colour: '#f47920',
            link: '/bookings/my',
          },
          {
            label: 'Approved bookings',
            value: approvedBookings,
            icon: CalendarDays,
            colour: '#10b981',
            link: '/bookings/my',
          },
          {
            label: 'Open tickets',
            value: openTickets,
            icon: Ticket,
            colour: '#3b82f6',
            link: '/tickets/my',
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.3 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
              onClick={() => navigate(card.link)}
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center
                                justify-center group-hover:scale-110 transition-transform"
                  style={{ background: `${card.colour}10` }}>
                  <Icon className="w-6 h-6"
                    style={{ color: card.colour }} />
                </div>
                <div>
                  <div className="text-3xl font-black"
                    style={{ color: '#182c51' }}>
                    {card.value}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                    {card.label}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid — Large Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent bookings */}
        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-[#182c51]">Recent bookings</CardTitle>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status Overview</p>
            </div>
            <Button variant="ghost" size="sm"
              className="rounded-full text-xs font-bold gap-2 hover:bg-slate-50 text-[#f47920]"
              onClick={() => navigate('/bookings/my')}>
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            {bookings.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <CalendarDays className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium mb-4">No bookings yet</p>
                <Button
                  size="sm"
                  className="rounded-xl font-bold px-6 border-none"
                  onClick={() => navigate('/student/resources')}
                  style={{ background: '#182c51', color: 'white' }}
                >
                  Browse resources
                </Button>
              </div>
            )}
            {bookings.slice(0, 4).map((booking) => (
              <div key={booking.id}
                className="flex items-center justify-between
                              border border-slate-50 rounded-2xl px-5 py-4 cursor-pointer
                              hover:bg-slate-50 transition-all hover:border-slate-200"
                onClick={() => navigate(`/bookings/${booking.id}`)}>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#182c51] truncate">
                    {booking.purpose || booking.resourceName || 'Campus Booking'}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(booking.startTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(booking.startTime).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent tickets */}
        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-[#182c51]">Recent tickets</CardTitle>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Issue Tracking</p>
            </div>
            <Button variant="ghost" size="sm"
              className="rounded-full text-xs font-bold gap-2 hover:bg-slate-50 text-[#f47920]"
              onClick={() => navigate('/tickets/my')}>
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            {tickets.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Ticket className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium mb-4">No tickets reported</p>
                <Button
                  size="sm"
                  className="rounded-xl font-bold px-6 border-none shadow-lg shadow-orange-500/20"
                  onClick={() => navigate('/tickets/new')}
                  style={{ background: '#f47920', color: '#182c51' }}
                >
                  Report an issue
                </Button>
              </div>
            )}
            {tickets.slice(0, 4).map((ticket) => (
              <div key={ticket.id}
                className="flex items-center justify-between
                              border border-slate-50 rounded-2xl px-5 py-5 cursor-pointer
                              hover:bg-slate-50 transition-all hover:border-slate-200"
                onClick={() => navigate(`/tickets/${ticket.id}`)}>
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-sm font-bold text-[#182c51] truncate mb-2">{ticket.title}</p>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={ticket.status} />
                    <SlaBadge
                      slaDeadline={ticket.slaDeadline}
                      slaBreached={ticket.slaBreached}
                      status={ticket.status}
                    />
                  </div>
                </div>
                <div className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                  #{ticket.id?.slice(-4) || 'TICK'}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
