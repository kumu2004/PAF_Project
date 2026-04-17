import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Grid3x3, List, Search, Settings2, LayoutGrid,
  Building2, FlaskConical, Users2, Projector, BookOpen,
  CheckCircle2, XCircle, PenTool, TrendingUp, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResourceSearchBar } from '../components/ResourceSearchBar';
import { ResourceFilters } from '../components/ResourceFilters';
import { ResourceTable } from '../components/ResourceTable';
import { ResourceCard } from '../components/ResourceCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeleteResource, useResources } from '../hooks/useResources';
import { useAuthStore } from '@/store/authStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TYPE_STATS = [
  { key: 'LECTURE_HALL', label: 'Lecture Halls', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { key: 'LAB',          label: 'Laboratories',  icon: FlaskConical, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { key: 'MEETING_ROOM', label: 'Meeting Rooms', icon: Users2, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { key: 'EQUIPMENT',    label: 'Equipment',     icon: Projector, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { key: 'LIBRARY',      label: 'Libraries',     icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  { key: 'STUDY_SPACE',  label: 'Study Spaces',  icon: BookOpen, color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
];

export default function ResourceListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isUser = user?.role === 'STUDENT' || user?.role === 'LECTURER' || user?.role === 'USER';

  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: isUser ? 'ACTIVE' : '',
    capacity: '',
    location: '',
    page: 0,
    size: 12,
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading, error } = useResources(filters);
  const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource();

  const resources = data?.content || [];
  const totalCount = data?.totalElements || resources.length;

  // Compute per-type counts for admin stat bar
  const typeCounts = TYPE_STATS.map(t => ({
    ...t,
    count: resources.filter(r => r.type === t.key).length,
  }));
  const activeCount  = resources.filter(r => r.status === 'ACTIVE').length;
  const inactiveCount = resources.filter(r => r.status !== 'ACTIVE').length;

  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value, page: 0 });
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 0 });
  };

  const handleDelete = (resourceId) => {
    if (!resourceId) return;
    deleteResource(resourceId, { onSuccess: () => setDeleteConfirm(null) });
  };

  const errorMessage =
    error?.response?.data?.message || error?.message || 'Failed to load resources.';

  return (
    <div className="space-y-6 p-4 sm:p-6">

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f1e3d 0%, #182c51 60%, #1a3460 100%)' }}
      >
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        {/* Orange glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-7 sm:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-[0.22em] mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                {isAdmin ? 'Admin Console' : 'Campus Facilities'}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                {isAdmin ? 'Resource Management' : isUser ? 'Discover Spaces' : 'Campus Resources'}
              </h1>
              <p className="text-white/55 text-sm max-w-lg leading-relaxed">
                {isAdmin
                  ? 'Create, manage, and monitor all campus spaces and equipment from one place.'
                  : 'Find and reserve high-tech laboratories, lecture halls, and premium meeting spaces.'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 shrink-0">
              {isAdmin && (
                <Button
                  onClick={() => navigate('/admin/resources/create')}
                  className="h-11 px-6 gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/30 hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4" />
                  Create Resource
                </Button>
              )}
            </div>
          </div>

          {/* Admin stat bar */}
          {isAdmin && !isLoading && resources.length > 0 && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {typeCounts.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setFilters(f => ({ ...f, type: f.type === t.key ? '' : t.key, page: 0 }))}
                  className={`group flex flex-col gap-1.5 p-3 rounded-2xl border transition-all
                    ${filters.type === t.key
                      ? `${t.bg} ${t.border} shadow-lg scale-[1.03]`
                      : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.bg}`}>
                    <t.icon className={`w-4 h-4 ${t.color}`} />
                  </div>
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-widest leading-tight">{t.label}</span>
                  <span className="text-white text-xl font-black leading-none">{t.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Status Summary Strip (admin only) ── */}
      {isAdmin && !isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-black">{activeCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Active</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-2xl font-black">{inactiveCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Inactive</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black">{totalCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Total</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Search + Filters ── */}
      <ResourceSearchBar
        value={searchTerm}
        onChange={handleSearch}
        onClear={() => {
          setSearchTerm('');
          setFilters({ ...filters, search: '', page: 0 });
        }}
      />

      <ResourceFilters
        filters={filters}
        showStatus={isAdmin}
        showCapacity={isAdmin || isUser}
        onFilterChange={handleFilterChange}
        onReset={() => setFilters({ search: '', type: '', status: '', capacity: '', location: '', page: 0, size: 12 })}
      />

      {/* ── Toolbar ── */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {filters.type && (
            <Badge
              variant="secondary"
              className="gap-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => setFilters(f => ({ ...f, type: '', page: 0 }))}
            >
              {filters.type.replace('_', ' ')} ✕
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalCount}</span> resource{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-1 bg-muted/60 p-1 rounded-xl">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0 rounded-lg"
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0 rounded-lg"
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Resources Display ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Settings2 className="w-7 h-7 text-primary animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Loading resources...</p>
          </motion.div>
        ) : error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4 rounded-3xl border border-rose-200 bg-rose-50/50">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-rose-700">Unable to load resources</p>
              <p className="text-rose-600 text-sm mt-1">{errorMessage}</p>
            </div>
          </motion.div>
        ) : resources.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-5 rounded-3xl border-2 border-dashed border-border/40 bg-muted/10">
            <div className="w-20 h-20 rounded-3xl bg-muted/60 flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">No resources found</p>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters or search term</p>
            </div>
            {isAdmin && (
              <Button onClick={() => navigate('/admin/resources/create')} size="sm" className="gap-2 mt-1">
                <Plus className="w-4 h-4" />
                Create First Resource
              </Button>
            )}
          </motion.div>
        ) : viewMode === 'table' ? (
          <motion.div key="table" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ResourceTable
              resources={resources}
              isLoading={isLoading}
              error={error}
              onDelete={(id) => setDeleteConfirm(id)}
            />
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {resources.map((resource, i) => {
              const resourceId = resource?.id || resource?._id;
              return (
                <motion.div
                  key={resourceId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <ResourceCard
                    resource={resource}
                    showActions={isAdmin}
                    showBookCta={isUser}
                    showStatusBadge={isAdmin || isTechnician}
                    onDelete={(id) => setDeleteConfirm(id)}
                    onEdit={(selectedResource) => {
                      const selectedId = selectedResource?.id || selectedResource?._id;
                      if (!selectedId) return;
                      navigate(`/admin/resources/${selectedId}/edit`);
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mb-2">
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. Any active bookings for this resource will need to be handled separately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end pt-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => handleDelete(deleteConfirm)}
              className="bg-rose-600 hover:bg-rose-700 rounded-xl"
            >
              {isDeleting ? 'Deleting...' : 'Delete Resource'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
