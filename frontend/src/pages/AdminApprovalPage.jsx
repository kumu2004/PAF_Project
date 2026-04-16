import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  UserCheck,
  ArrowLeft,
  GraduationCap,
  Wrench,
  Mail,
  Phone,
  Building2,
  Briefcase,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  FileText,
  Check,
  X,
} from 'lucide-react';

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function AdminApprovalPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvedError, setApprovedError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/admin/dashboard');
      return;
    }
    fetchPendingRequests();
    fetchApprovedHistory();
  }, [user, navigate]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/admin/registrations/pending');
      setRequests(res.data?.data || []);
    } catch (err) {
      setError('Failed to fetch pending requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedHistory = async () => {
    try {
      setApprovedError('');
      const res = await apiClient.get('/api/admin/registrations/approved');
      setApproved(res.data?.data || []);
    } catch (err) {
      setApprovedError(err.response?.data?.message || 'Failed to fetch approved history.');
    }
  };

  const handleApproval = async (userId, approve) => {
    const reason = !approve ? prompt('Enter rejection reason:') : null;
    if (!approve && reason === null) return;

    setProcessingId(userId);
    try {
      await apiClient.post(`/api/auth/approve-registration/${userId}`, {
        approved: approve,
        rejectionReason: reason,
      });
      setRequests(requests.filter((req) => req.id !== userId));
      if (approve) {
        fetchApprovedHistory();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const stats = {
    pending: requests.length,
    lecturers: requests.filter((r) => r.role === 'PENDING_LECTURER').length,
    technicians: requests.filter((r) => r.role === 'PENDING_TECHNICIAN').length,
    approved: approved.length,
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
        <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-7 sm:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 text-[10px] font-black uppercase tracking-[0.22em] mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Registration
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                Registration Requests
              </h1>
              <p className="text-white/55 text-sm max-w-lg leading-relaxed">
                Review and approve account applications for new lecturers and technicians.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Strip ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending Requests', value: stats.pending,     icon: UserCheck,     cls: 'text-primary',         bg: 'bg-primary/10' },
          { label: 'Lecturers',        value: stats.lecturers,   icon: GraduationCap, cls: 'text-emerald-500',     bg: 'bg-emerald-500/10' },
          { label: 'Technicians',      value: stats.technicians, icon: Wrench,        cls: 'text-amber-500',       bg: 'bg-amber-500/10' },
          { label: 'Total Approved',   value: stats.approved,    icon: CheckCircle2,  cls: 'text-violet-500',      bg: 'bg-violet-500/10' },
        ].map((s) => (
          <Card key={s.label} className="border-border/50 overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${s.bg} group-hover:scale-110 transition-transform`}>
                <s.icon className={`w-5 h-5 ${s.cls}`} />
              </div>
              <div>
                <p className="text-2xl font-black leading-none">{loading ? '—' : s.value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {error ? (
        <div className="px-4 py-3 text-sm font-semibold text-red-800 border border-red-200 rounded-2xl bg-red-50">
          {error}
        </div>
      ) : null}

      {/* Pending requests */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 p-8 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-2xl"
              style={{ background: 'rgba(124, 58, 237, 0.12)' }}
            >
              <UserCheck className="w-6 h-6" style={{ color: '#7c3aed' }} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-[#182c51]">Pending requests</CardTitle>
              <p className="mt-1 text-xs font-bold tracking-widest uppercase text-slate-400">
                Awaiting your decision
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {loading ? (
            <div className="py-12 font-medium text-center text-slate-500">Loading requests…</div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center border border-dashed rounded-3xl border-slate-200 bg-slate-50/50">
              <div
                className="flex items-center justify-center w-16 h-16 mx-auto mb-4 border rounded-2xl border-emerald-100 bg-emerald-50"
              >
                <Sparkles className="h-7 w-7 text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-[#182c51]">All caught up</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                There are no pending registration requests at the moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b-2 text-left">
                    <th className="font-black text-xs uppercase tracking-wider pl-6 py-4">Name</th>
                    <th className="font-black text-xs uppercase tracking-wider py-4">Type</th>
                    <th className="font-black text-xs uppercase tracking-wider py-4">Email</th>
                    <th className="font-black text-xs uppercase tracking-wider py-4">Position</th>
                    <th className="font-black text-xs uppercase tracking-wider py-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <AnimatePresence>
                    {requests.map((req, i) => {
                      const roleName = String(req.role || '').replace('PENDING_', '');
                      const position = req.lecturerPosition || req.technicianPosition || '—';
                      
                      return (
                        <motion.tr
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: i * 0.015 }}
                          key={req.id}
                          className="group border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="pl-6 py-4">
                            <div className="font-bold text-[#182c51]">
                              {req.title ? `${req.title} ` : ''}{req.firstName} {req.lastName}
                            </div>
                            <div className="text-xs font-semibold text-slate-400">{req.faculty || '—'}</div>
                          </td>
                          <td className="py-4">
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5">
                              {roleName}
                            </Badge>
                          </td>
                          <td className="py-4 font-medium text-slate-600 truncate max-w-[150px] sm:max-w-xs">{req.email || '—'}</td>
                          <td className="py-4 font-medium text-slate-600 truncate max-w-[150px] sm:max-w-xs">{position}</td>
                          <td className="pr-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 rounded-xl hover:bg-emerald-100 hover:text-emerald-700"
                                onClick={() => handleApproval(req.id, true)}
                                disabled={processingId === req.id}
                                title="Approve"
                              >
                                {processingId === req.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 rounded-xl hover:bg-rose-100 hover:text-rose-700"
                                onClick={() => handleApproval(req.id, false)}
                                disabled={processingId === req.id}
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved history */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 p-8 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-2xl"
              style={{ background: 'rgba(244,121,32,0.12)' }}
            >
              <CheckCircle2 className="w-6 h-6" style={{ color: '#f47920' }} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-[#182c51]">Approved requests history</CardTitle>
              <p className="mt-1 text-xs font-bold tracking-widest uppercase text-slate-400">
                Request time · Approved time
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-bold rounded-full border-slate-200 text-slate-600 hover:bg-slate-50"
            onClick={fetchApprovedHistory}
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {approvedError ? (
            <div className="px-4 py-3 mb-4 text-sm font-semibold text-red-800 border border-red-200 rounded-2xl bg-red-50">
              {approvedError}
            </div>
          ) : null}

          {approved.length === 0 ? (
            <div className="py-12 text-center border border-dashed rounded-3xl border-slate-200 bg-slate-50/50">
              <p className="font-medium text-slate-500">No approved requests yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b-2 text-left">
                    <th className="font-black text-xs uppercase tracking-wider pl-6 py-4">Name</th>
                    <th className="font-black text-xs uppercase tracking-wider py-4">Type</th>
                    <th className="font-black text-xs uppercase tracking-wider py-4">Email</th>
                    <th className="font-black text-xs uppercase tracking-wider py-4">Position</th>
                    <th className="font-black text-xs uppercase tracking-wider py-4">Request time</th>
                    <th className="font-black text-xs uppercase tracking-wider py-4 pr-6">Approved time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {approved.map((r, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.015 }}
                      key={`${r.userId}-${r.approvedAt || ''}`} 
                      className="group border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="pl-6 py-4">
                        <div className="font-bold text-[#182c51]">{r.fullName || '—'}</div>
                        <div className="text-xs font-semibold text-slate-400">{r.faculty || '—'}</div>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5">
                          {r.requestType || '—'}
                        </Badge>
                      </td>
                      <td className="py-4 font-medium text-slate-600 truncate max-w-[150px] sm:max-w-xs">{r.email || '—'}</td>
                      <td className="py-4 font-medium text-slate-600 truncate max-w-[150px] sm:max-w-xs">{r.position || '—'}</td>
                      <td className="py-4 font-medium text-slate-600">{formatDateTime(r.requestedAt)}</td>
                      <td className="pr-6 py-4 font-medium text-slate-600">{formatDateTime(r.approvedAt)}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
