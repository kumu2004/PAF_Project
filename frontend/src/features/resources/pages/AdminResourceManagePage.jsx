import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, FlaskConical, Users2, Projector, BookOpen,
  CheckCircle2, XCircle, PenTool, TrendingUp,
  Plus, Search, Loader2, Pencil, Trash2, Eye,
  LayoutGrid, List, Settings2, AlertTriangle, Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResources, useDeleteResource, useUpdateResourceStatus } from '../hooks/useResources';
import { ResourceCard } from '../components/ResourceCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

/* ─── Type config ───────────────────────────────────────── */
const TYPE_CONFIG = {
  LECTURE_HALL: { label: 'Lecture Hall',  icon: Building2,    color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  LAB:          { label: 'Laboratory',    icon: FlaskConical, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  MEETING_ROOM: { label: 'Meeting Room',  icon: Users2,       color: 'text-violet-500',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20' },
  EQUIPMENT:    { label: 'Equipment',     icon: Projector,    color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  LIBRARY:      { label: 'Library',       icon: BookOpen,     color: 'text-indigo-500',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  STUDY_SPACE:  { label: 'Study Space',   icon: BookOpen,     color: 'text-teal-500',    bg: 'bg-teal-500/10',    border: 'border-teal-500/20' },
};

const STATUS_CONFIG = {
  ACTIVE:           { label: 'Active',          dot: 'bg-emerald-500', cls: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
  UNDER_MAINTENANCE:{ label: 'Maintenance',     dot: 'bg-amber-500',   cls: 'bg-amber-500/10  text-amber-700  border-amber-200' },
  OUT_OF_SERVICE:   { label: 'Out of Service',  dot: 'bg-rose-500',    cls: 'bg-rose-500/10   text-rose-700   border-rose-200' },
};

/* ─── Main Page ─────────────────────────────────────────── */
export default function AdminResourceManagePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm]   = useState('');
  const [deleteId,   setDeleteId]     = useState(null);
  const [viewMode,   setViewMode]     = useState('table'); // 'table' | 'grid'
  const [typeFilter, setTypeFilter]   = useState('');

  const { data, isLoading } = useResources({ search: searchTerm, type: typeFilter, size: 50 });
  const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource();
  const { mutate: updateStatus } = useUpdateResourceStatus();

  const resources  = data?.content || [];
  const totalCount = data?.totalElements || resources.length;

  /* Stats */
  const stats = {
    total:        resources.length,
    active:       resources.filter(r => r.status === 'ACTIVE').length,
    outOfService: resources.filter(r => r.status === 'OUT_OF_SERVICE').length,
    maintenance:  resources.filter(r => r.status === 'UNDER_MAINTENANCE').length,
  };

  const typeCounts = Object.entries(TYPE_CONFIG).map(([key, cfg]) => ({
    key,
    ...cfg,
    count: resources.filter(r => r.type === key).length,
  }));

  const deletingResource = resources.find(r => r.id === deleteId);

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    updateStatus({ id, status: newStatus }, {
      onSuccess: () => toast.success('Resource status updated'),
      onError:   (e) => toast.error('Failed: ' + e.message),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteResource(deleteId, {
      onSuccess: () => { toast.success('Resource deleted'); setDeleteId(null); },
      onError:   (e) => toast.error('Failed: ' + e.message),
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">

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
        <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-blue-500/10  rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-7 sm:p-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Title */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black uppercase tracking-[0.22em] mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Admin Console
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                Resource Management
              </h1>
              <p className="text-white/55 text-sm max-w-lg leading-relaxed">
                Create, manage, and monitor all campus spaces and equipment inventory from one place.
              </p>
            </div>
            {/* Action */}
            <Button
              onClick={() => navigate('/admin/resources/create')}
              className="h-11 px-6 gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create Resource
            </Button>
          </div>

          {/* Type filter tiles */}
          {!isLoading && resources.length > 0 && (
            <div className="mt-8 grid grid-cols-3 sm:grid-cols-6 gap-3">
              {typeCounts.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTypeFilter(f => f === t.key ? '' : t.key)}
                  className={`flex flex-col gap-1.5 p-3 rounded-2xl border transition-all text-left
                    ${typeFilter === t.key
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

      {/* ── Stats Strip ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Resources', value: stats.total,        icon: Layers,        cls: 'text-primary',         bg: 'bg-primary/10' },
          { label: 'Active',          value: stats.active,       icon: CheckCircle2,  cls: 'text-emerald-500',     bg: 'bg-emerald-500/10' },
          { label: 'Maintenance',     value: stats.maintenance,  icon: PenTool,       cls: 'text-amber-500',       bg: 'bg-amber-500/10' },
          { label: 'Out of Service',  value: stats.outOfService, icon: XCircle,       cls: 'text-rose-500',        bg: 'bg-rose-500/10' },
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

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, location..."
            className="pl-9 h-10 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {typeFilter && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors text-xs px-3 py-1.5"
              onClick={() => setTypeFilter('')}
            >
              {TYPE_CONFIG[typeFilter]?.label} ✕
            </Badge>
          )}
          <span className="text-sm text-muted-foreground hidden sm:block">
            <span className="font-semibold text-foreground">{totalCount}</span> resources
          </span>
          {/* View mode */}
          <div className="flex gap-1 bg-muted/60 p-1 rounded-xl">
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0 rounded-lg" onClick={() => setViewMode('table')} title="Table">
              <List className="w-3.5 h-3.5" />
            </Button>
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-7 w-7 p-0 rounded-lg" onClick={() => setViewMode('grid')} title="Grid">
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Settings2 className="w-7 h-7 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Loading resource catalog...</p>
          </motion.div>

        ) : resources.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-5 rounded-3xl border-2 border-dashed border-border/40 bg-muted/10">
            <div className="w-20 h-20 rounded-3xl bg-muted/60 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <div className="text-center">
              <p className="font-bold text-lg">No resources found</p>
              <p className="text-muted-foreground text-sm mt-1">
                {searchTerm || typeFilter ? 'Try adjusting your search or filter' : 'Create your first resource to get started'}
              </p>
            </div>
            <Button onClick={() => navigate('/admin/resources/create')} size="sm" className="gap-2 mt-1">
              <Plus className="w-4 h-4" />
              Create Resource
            </Button>
          </motion.div>

        ) : viewMode === 'grid' ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {resources.map((resource, i) => (
              <motion.div key={resource.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <ResourceCard
                  resource={resource}
                  showActions
                  showStatusBadge
                  onDelete={(id) => setDeleteId(id)}
                  onEdit={(r) => { const id = r?.id || r?._id; if (id) navigate(`/admin/resources/${id}/edit`); }}
                />
              </motion.div>
            ))}
          </motion.div>

        ) : (
          /* ── Table View ── */
          <motion.div key="table" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/50 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-muted/40 border-b-2">
                      <TableHead className="font-black text-xs uppercase tracking-wider pl-6">Resource</TableHead>
                      <TableHead className="font-black text-xs uppercase tracking-wider">Type</TableHead>
                      <TableHead className="font-black text-xs uppercase tracking-wider">Location</TableHead>
                      <TableHead className="font-black text-xs uppercase tracking-wider">Status</TableHead>
                      <TableHead className="font-black text-xs uppercase tracking-wider text-center">Cap.</TableHead>
                      <TableHead className="font-black text-xs uppercase tracking-wider text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((resource, i) => {
                      const typeCfg   = TYPE_CONFIG[resource.type]   || TYPE_CONFIG.LECTURE_HALL;
                      const statusCfg = STATUS_CONFIG[resource.status] || STATUS_CONFIG.ACTIVE;
                      const TypeIcon  = typeCfg.icon;
                      return (
                        <motion.tr
                          key={resource.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.025 }}
                          className="group border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          {/* Resource name + avatar */}
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeCfg.bg}`}>
                                <TypeIcon className={`w-5 h-5 ${typeCfg.color}`} />
                              </div>
                              <div>
                                <p className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-1">
                                  {resource.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-60">
                                  {resource.id?.slice(0, 12)}…
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Type badge */}
                          <TableCell>
                            <Badge variant="outline"
                              className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 ${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`}>
                              {typeCfg.label}
                            </Badge>
                          </TableCell>

                          {/* Location */}
                          <TableCell className="text-sm text-muted-foreground max-w-[180px]">
                            <span className="line-clamp-1">{resource.location}</span>
                          </TableCell>

                          {/* Status — clickable toggle */}
                          <TableCell>
                            <button
                              onClick={() => handleToggleStatus(resource.id, resource.status)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all hover:opacity-80 ${statusCfg.cls}`}
                              title="Click to toggle Active / Out of Service"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusCfg.dot}`} />
                              {statusCfg.label}
                            </button>
                          </TableCell>

                          {/* Capacity */}
                          <TableCell className="text-center font-bold text-sm">{resource.capacity}</TableCell>

                          {/* Actions */}
                          <TableCell className="pr-6">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary"
                                onClick={() => navigate(`/admin/resources/${resource.id}`)}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 rounded-xl hover:bg-blue-100 hover:text-blue-700"
                                onClick={() => navigate(`/admin/resources/${resource.id}/edit`)}
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 rounded-xl hover:bg-rose-100 hover:text-rose-700"
                                onClick={() => setDeleteId(resource.id)}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Dialog ── */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            <AlertDialogTitle className="text-xl font-black">Delete Resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-bold text-foreground">{deletingResource?.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 font-bold rounded-xl"
            >
              {isDeleting ? 'Deleting...' : 'Delete Resource'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
