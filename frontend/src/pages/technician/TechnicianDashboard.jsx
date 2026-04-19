import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { SlaBadge } from '../../features/ticket/components/SlaBadge';
import {
  Wrench, AlertTriangle, CheckCircle,
  Clock, ArrowRight
} from 'lucide-react';

import { motion } from 'framer-motion';
import { NotificationBell } from '../../features/notifications/components/NotificationBell';

const PRIORITY_STYLES = {
  LOW: { bg: 'bg-slate-100', text: 'text-slate-600' },
  MEDIUM: { bg: 'bg-blue-100', text: 'text-blue-700' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function TechnicianDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Technician only sees tickets assigned to them
  const { data: tickets = [], refetch } = useQuery({
    queryKey: ['my-assigned-tickets'],
    queryFn: () => api.get('/api/tickets/assigned').then((r) => r.data.data || []),
  });

  // Sort by urgency — CRITICAL first, then SLA breached, then HIGH
  const sortedTickets = [...tickets].sort((a, b) => {
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    if (a.slaBreached !== b.slaBreached) return a.slaBreached ? -1 : 1;
    return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
  });

  const openCount = tickets.filter((t) => ['OPEN', 'ASSIGNED'].includes(t.status)).length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedToday = tickets.filter((t) => {
    if (t.status !== 'RESOLVED' || !t.resolvedAt) return false;
    return new Date(t.resolvedAt).toDateString() === new Date().toDateString();
  }).length;
  const breachedCount = tickets.filter((t) => t.slaBreached).length;

  const firstName = user?.firstName || user?.fullName?.split(' ')[0] || 'Technician';

  // Handle status update with automatic refetch
  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await api.patch(`/api/tickets/${ticketId}/status`, { status: newStatus });
      // Refetch the tickets to update dashboard counts
      await refetch();
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  };

  // Setup automatic refetch every 30 seconds for real-time updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refetch every 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="space-y-8 pb-12">

      {/* Work queue header — Landing Style */}
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
              <Wrench className="w-3.5 h-3.5" />
              {user?.technicianPosition || 'Technician'} Support Queue
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Work Queue: <span style={{ color: '#f47920' }}>{firstName}</span>
            </h1>
            <p className="text-slate-400 text-lg mt-4 max-w-xl">
              Track and resolve campus maintenance incidents with real-time SLA monitoring.
            </p>
          </div>

          {/* SLA breach alert */}
          {breachedCount > 0 && (
            <div className="flex items-center gap-3 px-6 py-4 rounded-[1.5rem] bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-red-500 font-black text-lg leading-none">{breachedCount}</p>
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1">SLA Breaches</p>
              </div>
            </div>
          )}
          {/* Notification Bell */}
          <NotificationBell />
        </div>
      </motion.div>

      {/* Stat cards — Landing Style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          {
            label: 'Open',
            value: openCount,
            icon: Clock,
            colour: '#f47920',
          },
          {
            label: 'In progress',
            value: inProgressCount,
            icon: Wrench,
            colour: '#3b82f6',
          },
          {
            label: 'Resolved today',
            value: resolvedToday,
            icon: CheckCircle,
            colour: '#10b981',
          },
          {
            label: 'SLA breached',
            value: breachedCount,
            icon: AlertTriangle,
            colour: '#ef4444',
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.3 }}
              className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-center sm:items-start gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${card.colour}10` }}>
                  <Icon className="w-6 h-6"
                    style={{ color: card.colour }} />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-3xl font-black text-[#182c51]">
                    {card.value}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {card.label}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Ticket work queue — Large Card Style */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-[#182c51]">Ticket queue</CardTitle>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Assigned Tasks</p>
          </div>
          <Button variant="ghost" size="sm"
            className="rounded-full text-xs font-bold gap-2 text-[#f47920] hover:bg-slate-50"
            onClick={() => navigate('/tickets/assigned')}>
            Full list <ArrowRight className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {sortedTickets.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-[#182c51]">All clear!</h3>
              <p className="text-slate-500 font-medium mt-2">
                No tickets assigned to you right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedTickets.slice(0, 8).map((ticket) => {
                const ps = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.MEDIUM;
                return (
                  <div
                    key={ticket.id}
                    className={`flex flex-col border rounded-3xl p-6 cursor-pointer
                                hover:bg-slate-50 transition-all group
                                ${ticket.slaBreached
                        ? 'border-red-200 bg-red-50/20'
                        : 'border-slate-50 hover:border-slate-200'}`}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-black text-[#182c51] truncate group-hover:text-[#f47920] transition-colors font-sans">
                            {ticket.title}
                          </p>
                          {ticket.slaBreached && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium line-clamp-1">
                          {ticket.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                        #{ticket.id?.slice(-4) || 'TASK'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={ticket.status} />
                        <span className={`text-[10px] font-black px-3 py-1 uppercase tracking-tighter
                                          rounded-full ${ps.bg} ${ps.text}`}>
                          {ticket.priority}
                        </span>
                        <SlaBadge
                          slaDeadline={ticket.slaDeadline}
                          slaBreached={ticket.slaBreached}
                          status={ticket.status}
                        />
                      </div>
                      
                      {/* Quick Start Button */}
                      {['OPEN', 'ASSIGNED'].includes(ticket.status) && (
                        <Button
                          size="sm"
                          className="h-9 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent navigation to detail page
                            handleStatusUpdate(ticket.id, 'IN_PROGRESS');
                          }}
                        >
                          <Wrench className="w-4 h-4 mr-2" />
                          Start Work
                        </Button>
                      )}

                      {/* Display Date if not showing button */}
                      {!['OPEN', 'ASSIGNED'].includes(ticket.status) && (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
