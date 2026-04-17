import { useQuery }     from '@tanstack/react-query';
import { useNavigate }  from 'react-router-dom';
import api              from '../../services/apiClient';
import { useAuthStore }     from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button }       from '../../components/ui/button';
import { StatusBadge }  from '../../components/shared/StatusBadge';
import { CalendarDays, BookOpen, Plus, ArrowRight,
         Clock, GraduationCap }                    from 'lucide-react';

import { motion }          from 'framer-motion';

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function LecturerDashboard() {
  const { user }   = useAuthStore();
  const navigate   = useNavigate();

  const { data: bookings = [] } = useQuery({
    queryKey: ['my-bookings'],
    queryFn:  () => api.get('/api/bookings/my').then((r) => toArray(r.data)),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['my-tickets'],
    queryFn:  () => api.get('/api/tickets/my').then((r) => r.data.data || []),
  });

  // Upcoming approved bookings — most relevant for lecturers
  const upcoming = bookings
    .filter((b) =>
      b.status === 'APPROVED' &&
      new Date(b.startTime) > new Date()
    )
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const pendingCount  = bookings.filter((b) => b.status === 'PENDING').length;
  const openTickets   = tickets.filter((t) =>
    ['OPEN', 'IN_PROGRESS'].includes(t.status)
  ).length;

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'Lecturer';

  return (
    <div className="space-y-8 pb-12">

      {/* Welcome banner — Landing Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
        style={{ background: '#182c51' }}
      >
        {/* Subtle Decorative Background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='none' stroke='%23f47920' stroke-width='1' stroke-opacity='0.15'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px'
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border"
                 style={{ background: 'rgba(244,121,32,0.1)', borderColor: 'rgba(244,121,32,0.3)', color: '#f47920' }}>
              <GraduationCap className="w-3.5 h-3.5" />
              {user?.lecturerPosition || 'Lecturer'} @ {user?.faculty || 'SLIIT'}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Greetings, <span style={{ color: '#f47920' }}>{user?.title || ''} {firstName}</span>
            </h1>
            <p className="text-slate-400 text-lg mt-4 max-w-xl">
              Efficiently coordinate your academic schedule and facility requirements.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              size="lg"
              className="rounded-2xl font-bold h-14 px-8 shadow-xl shadow-orange-500/20 active:scale-95 transition-all text-xs"
              onClick={() => navigate('/resources')}
              style={{ background: '#f47920', color: '#182c51' }}
            >
              <Plus className="w-5 h-5 mr-1.5" />
              Book Facility
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl font-bold h-14 px-8 border-white/20 text-white hover:bg-white/10 active:scale-95 transition-all text-xs"
              onClick={() => navigate('/tickets/new')}
            >
              Report Issue
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stat cards — Landing Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label:  'Upcoming bookings',
            value:  upcoming.length,
            icon:   CalendarDays,
            colour: '#10b981',
          },
          {
            label:  'Awaiting approval',
            value:  pendingCount,
            icon:   Clock,
            colour: '#f47920',
          },
          {
            label:  'Open tickets',
            value:  openTickets,
            icon:   BookOpen,
            colour: '#3b82f6',
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.3 }}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center
                                justify-center group-hover:scale-110 transition-transform"
                     style={{ background: `${card.colour}10` }}>
                  <Icon className="w-6 h-6"
                        style={{ color: card.colour }} />
                </div>
                <div>
                  <div className="text-3xl font-black text-[#182c51]">
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

      {/* Upcoming schedule — Large Card Style */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-[#182c51]">Upcoming bookings</CardTitle>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Calendar Overview</p>
          </div>
          <Button variant="ghost" size="sm"
                  className="rounded-full text-xs font-bold gap-2 text-[#f47920] hover:bg-slate-50"
                  onClick={() => navigate('/bookings/my')}>
            View all <ArrowRight className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {upcoming.length === 0 ? (
            <div className="py-12 text-center text-[#182c51]">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <CalendarDays className="w-6 h-6 text-slate-300" />
              </div>
              <p className="font-medium text-slate-500 mb-4">No upcoming bookings</p>
              <Button
                size="sm"
                className="rounded-xl font-bold px-8 border-none h-11"
                onClick={() => navigate('/resources')}
                style={{ background: '#182c51', color: 'white' }}
              >
                Browse facilities
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.slice(0, 6).map((booking) => (
                <div key={booking.id}
                     className="flex items-center gap-5 border border-slate-50 rounded-2xl px-5 py-4
                                cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-all"
                     onClick={() => navigate(`/bookings/${booking.id}`)}>

                  {/* Date block */}
                  <div className="text-center w-12 flex-shrink-0">
                    <div className="text-xl font-black leading-none text-[#182c51]">
                      {new Date(booking.startTime).getDate()}
                    </div>
                    <div className="text-[10px] text-[#f47920] font-black uppercase tracking-tighter mt-1">
                      {new Date(booking.startTime).toLocaleString('default', {
                        month: 'short',
                      })}
                    </div>
                  </div>

                  <div className="w-px h-10 bg-slate-100 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#182c51] truncate">
                      {booking.resourceName || booking.resourceId}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      {new Date(booking.startTime).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit',
                      })} — {new Date(booking.endTime).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
