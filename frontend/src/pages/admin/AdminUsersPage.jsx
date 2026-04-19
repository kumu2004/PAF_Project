import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/apiClient';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Trash2, UsersRound, CheckCircle2, XCircle, Lock, Unlock, Users } from 'lucide-react';

function extractUsersResponse(payload) {
  // Most endpoints return ApiResponse<T> => { success, message, data }
  if (payload && typeof payload === 'object') {
    const maybeApiResponse = payload;
    if (Array.isArray(maybeApiResponse.data)) return maybeApiResponse.data;
  }
  // Some endpoints may already return the array directly
  if (Array.isArray(payload)) return payload;
  return [];
}

function roleLabel(role) {
  if (!role) return '—';
  return String(role).replace('PENDING_', '');
}

function statusVariant(status) {
  switch (status) {
    case 'ACTIVE':
      return 'default';
    case 'PENDING':
      return 'secondary';
    case 'REJECTED':
      return 'destructive';
    case 'SUSPENDED':
      return 'outline';
    default:
      return 'outline';
  }
}

function userRowId(u) {
  const raw = u?.id || u?.userId || '';
  if (!raw) return '';
  const s = String(raw).trim();
  // Normalize legacy ids like ObjectId("abc...") from bad serialization
  const m = s.match(/[\"']([a-fA-F0-9]{24})[\"']/);
  if (m) return m[1];
  if (/^ObjectId/i.test(s) && s.length >= 24) {
    const hex = s.match(/[a-fA-F0-9]{24}/);
    if (hex) return hex[0];
  }
  return s;
}

function assertApiEnvelope(response) {
  const body = response?.data;
  if (body && body.success === false) {
    const err = new Error(body.message || 'Request failed');
    err.response = { data: body };
    throw err;
  }
  return response;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionError, setActionError] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const queryKey = useMemo(() => ['admin-users', debouncedSearch], [debouncedSearch]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () =>
      api
        .get('/api/admin/users', {
          params: debouncedSearch ? { search: debouncedSearch } : undefined,
        })
        .then((r) => extractUsersResponse(r.data)),
    staleTime: 30_000,
    retry: 1,
  });

  const users = Array.isArray(data) ? data : [];
  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    'Failed to load users.';

  const refreshUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    await queryClient.refetchQueries({ queryKey: ['admin-users'] });
  };

  const disableMutation = useMutation({
    mutationFn: async (userId) => {
      const r = await api.post(
        `/api/admin/users/${encodeURIComponent(userId)}/disable`,
        {}
      );
      return assertApiEnvelope(r);
    },
    onMutate: () => setActionError(''),
    onSuccess: () => refreshUsers(),
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Could not disable user.';
      setActionError(msg);
    },
  });

  const enableMutation = useMutation({
    mutationFn: async (userId) => {
      const r = await api.post(
        `/api/admin/users/${encodeURIComponent(userId)}/enable`,
        {}
      );
      return assertApiEnvelope(r);
    },
    onMutate: () => setActionError(''),
    onSuccess: () => refreshUsers(),
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Could not enable user.';
      setActionError(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId) => {
      const r = await api.delete(`/api/admin/users/${encodeURIComponent(userId)}`);
      return assertApiEnvelope(r);
    },
    onMutate: () => setActionError(''),
    onSuccess: () => refreshUsers(),
    onError: (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Could not delete user.';
      setActionError(msg);
    },
  });

  const isBusy = disableMutation.isPending || enableMutation.isPending || deleteMutation.isPending;

  function handleToggleActive(user) {
    const id = userRowId(user);
    if (!id) {
      setActionError('Missing user id — cannot update.');
      return;
    }
    const isActive = Boolean(user.active);
    if (isActive) disableMutation.mutate(id);
    else enableMutation.mutate(id);
  }

  function handleDelete(user) {
    const id = userRowId(user);
    if (!id) {
      setActionError('Missing user id — cannot delete.');
      return;
    }
    const ok = window.confirm(
      `Delete account for ${user.firstName || ''} ${user.lastName || ''} (${user.email || 'no-email'})?\n\nThis cannot be undone.`
    );
    if (ok) deleteMutation.mutate(id);
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.active).length,
    inactive: users.filter((u) => u.active === false).length,
    pending: users.filter((u) => u.status === 'PENDING').length,
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
                Admin Console
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                User Management
              </h1>
              <p className="text-white/55 text-sm max-w-lg leading-relaxed">
                Manage system users, roles, account status, and platform access.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Strip ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',     value: stats.total,    icon: UsersRound,    cls: 'text-primary',         bg: 'bg-primary/10' },
          { label: 'Active',          value: stats.active,   icon: CheckCircle2,  cls: 'text-emerald-500',     bg: 'bg-emerald-500/10' },
          { label: 'Inactive/Locked', value: stats.inactive, icon: Lock,          cls: 'text-amber-500',       bg: 'bg-amber-500/10' },
          { label: 'Pending Approval',value: stats.pending,  icon: Users,         cls: 'text-rose-500',        bg: 'bg-rose-500/10' },
        ].map((s) => (
          <Card key={s.label} className="border-border/50 overflow-hidden group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${s.bg} group-hover:scale-110 transition-transform`}>
                <s.icon className={`w-5 h-5 ${s.cls}`} />
              </div>
              <div>
                <p className="text-2xl font-black leading-none">{isLoading ? '—' : s.value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* ── Table Area ── */}
      <Card className="rounded-[2.5rem] border-slate-100 shadow-sm mt-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-6 pb-4 border-b border-slate-50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute w-4 h-4 -translate-y-1/2 text-muted-foreground left-4 top-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="bg-white rounded-full pl-11 border-slate-200 h-10"
            />
          </div>
          <span className="text-sm text-muted-foreground font-semibold px-4">
            {users.length} users
          </span>
        </div>

        <CardContent className="p-0">
          {actionError ? (
            <div className="m-6 px-4 py-3 text-sm font-semibold text-red-800 border border-red-200 rounded-2xl bg-red-50">
              {actionError}
            </div>
          ) : null}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-16 text-center text-slate-500 text-sm font-medium">Loading users…</motion.div>
            ) : isError ? (
              <motion.div key="error" className="py-16 text-center text-red-600 font-bold">{errorMessage}</motion.div>
            ) : users.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-16 text-center text-slate-500 text-sm font-medium">No users found.</motion.div>
            ) : (
              <motion.div key="table" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b-2 text-left">
                      <th className="font-black text-xs uppercase tracking-wider pl-6 py-4">User</th>
                      <th className="font-black text-xs uppercase tracking-wider py-4">Role</th>
                      <th className="font-black text-xs uppercase tracking-wider py-4">Status</th>
                      <th className="font-black text-xs uppercase tracking-wider py-4 text-center">Faculty</th>
                      <th className="font-black text-xs uppercase tracking-wider py-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {users.map((u, i) => {
                      const initials = ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase() || 'U';
                      return (
                        <motion.tr
                          key={userRowId(u) || u.email}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.015 }}
                          className="group border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/10 border border-blue-500/20">
                                <span className="text-blue-600 font-bold text-sm tracking-wider">{initials}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm group-hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-[260px]">
                                  {u.title ? `${u.title} ` : ''}{u.firstName} {u.lastName}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[200px] sm:max-w-[260px] font-medium">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5">
                              {roleLabel(u.role)}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <Badge
                              variant={statusVariant(u.status)}
                              className="rounded-full text-[10px] font-black"
                            >
                              {u.status || '—'}
                            </Badge>
                          </td>
                          <td className="py-4 text-center">
                            <span className="text-sm font-medium text-slate-600 line-clamp-1">{u.faculty || '—'}</span>
                          </td>
                          <td className="pr-6 py-4">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 rounded-xl hover:bg-amber-100 hover:text-amber-700"
                                onClick={() => handleToggleActive(u)}
                                disabled={isBusy}
                                title={u.active ? 'Disable Account' : 'Enable Account'}
                              >
                                {u.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 rounded-xl hover:bg-rose-100 hover:text-rose-700"
                                onClick={() => handleDelete(u)}
                                disabled={isBusy}
                                title="Delete Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

