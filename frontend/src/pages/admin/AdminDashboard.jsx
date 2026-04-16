import { useQuery }        from '@tanstack/react-query';
import api                 from '../../services/apiClient'; // modified from src/config/axios
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge }           from '../../components/ui/badge';
import { Button }          from '../../components/ui/button';
import { useNavigate }     from 'react-router-dom';
import {
  Users, BookOpen, Ticket, AlertCircle,
  CheckCircle, Clock, TrendingUp, Building2, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';

function useAdminStats() {
  return useQuery({
    queryKey:        ['admin-stats'],
    queryFn:         () => api.get('/api/admin/stats').then((r) => r.data.data),
    refetchInterval: 30_000, 
  });
}

function usePendingRegistrations() {
  return useQuery({
    queryKey: ['admin-pending-registrations'],
    queryFn:  () => api.get('/api/admin/registrations/pending').then((r) => r.data.data),
    refetchInterval: 60_000,
  });
}

const STATUS_COLOURS = {
  PENDING:    '#f59e0b',
  APPROVED:   '#10b981',
  REJECTED:   '#ef4444',
  CANCELLED:  '#64748b',
};

export default function AdminDashboard() {
  const navigate          = useNavigate();
  const { data: stats }   = useAdminStats();
  const { data: pending } = usePendingRegistrations();
  const pendingList = Array.isArray(pending) ? pending : [];

  const STAT_CARDS = [
    {
      label:  'Total resources',
      value:  stats?.totalResources ?? '—',
      icon:   Building2,
      colour: '#182c51',
      sub:    'Across all faculties',
      link:   '/admin/resources',
    },
    {
      label:  'Pending bookings',
      value:  stats?.pendingBookings ?? '—',
      icon:   Clock,
      colour: '#f47920',
      sub:    'Awaiting your approval',
      link:   '/admin/bookings',
      urgent: (stats?.pendingBookings || 0) > 0,
    },
    {
      label:  'Open tickets',
      value:  stats?.openTickets ?? '—',
      icon:   Ticket,
      colour: '#ef4444',
      sub:    'Unresolved incidents',
      link:   '/admin/tickets',
      urgent: (stats?.openTickets || 0) > 0,
    },
    {
      label:  'Pending registrations',
      value:  pendingList.length ?? '—',
      icon:   Users,
      colour: '#7c3aed',
      sub:    'Lecturers & technicians',
      link:   '/admin/registrations',
      urgent: pendingList.length > 0,
    },
  ];

  const bookingChartData = stats?.bookingsByStatus?.map((b) => ({
    name:  b._id,
    value: b.count,
  })) || [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#182c51]">
            Admin Dashboard
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            System overview — {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className={`cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all rounded-[2rem] border-slate-100
                          ${card.urgent ? 'ring-2 ring-orange-400/50' : ''}`}
              onClick={() => navigate(card.link)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center
                                  justify-center"
                       style={{ background: `${card.colour}10` }}>
                    <Icon className="w-6 h-6"
                          style={{ color: card.colour }} />
                  </div>
                  {card.urgent && (
                    <Badge variant="outline"
                           className="text-[10px] font-black uppercase tracking-tighter border-orange-400 text-orange-600 rounded-full">
                      Action needed
                    </Badge>
                  )}
                </div>
                <div className="text-4xl font-black mb-1"
                     style={{ color: '#182c51' }}>
                  {card.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {card.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 italic">
                  {card.sub}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm">
          <CardHeader className="p-8 pb-2">
            <CardTitle className="text-lg font-bold text-[#182c51]">Bookings by status</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {bookingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={bookingChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {bookingChartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLOURS[entry.name] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center
                              text-muted-foreground text-sm">
                No booking data yet
              </div>
            )}
            <div className="flex flex-wrap gap-4 mt-4">
              {Object.entries(STATUS_COLOURS).map(([status, colour]) => (
                <div key={status} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: colour }} />
                  {status}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-slate-100 shadow-sm">
          <CardHeader className="p-8 pb-2">
            <CardTitle className="text-lg font-bold text-[#182c51]">Most booked resources</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {stats?.topBookedResources?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={stats.topBookedResources}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <XAxis type="number" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis
                    type="category"
                    dataKey="_id"
                    width={100}
                    tick={{ fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="bookingCount"
                    fill="#182c51"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center
                              text-muted-foreground text-sm">
                No resource data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm">
        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-[#182c51]">Pending registrations</CardTitle>
          <Button
            variant="ghost" size="sm"
            className="rounded-full text-xs font-bold gap-2 text-[#f47920] hover:bg-slate-50"
            onClick={() => navigate('/admin/registrations')}
          >
            View all <ArrowRight className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {pendingList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingList.slice(0, 6).map((reg) => (
                <div key={reg.id}
                     className="flex items-center justify-between
                                border border-slate-50 rounded-2xl px-5 py-4 hover:border-slate-200 transition-all">
                  <div className="min-w-0 flex-1 mr-4">
                    <p className="text-sm font-bold text-[#182c51] truncate">
                      {reg.title ? `${reg.title} ` : ''}{reg.firstName} {reg.lastName}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      {String(reg.role || '').replace('PENDING_', '')} · {reg.lecturerPosition || reg.technicianPosition || '—'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-xl font-bold h-9 px-4"
                    onClick={() => navigate('/admin/registrations')}
                    style={{ background: '#182c51', color: 'white' }}
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-slate-500 font-medium">No pending registrations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
