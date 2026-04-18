import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket } from '../hooks/useTickets';
import { useTicketActions } from '../hooks/useTicketActions';
import TicketStatusBadge from '../components/TicketStatusBadge';
import TicketPriorityBadge from '../components/TicketPriorityBadge';
import TicketStatusFlow from '../components/TicketStatusFlow';
import CommentThread from '../components/CommentThread';
import AttachmentUploader from '../components/AttachmentUploader';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import { Skeleton } from '../../../components/ui/skeleton';
import { ArrowLeft, Calendar, User, MapPin, Tag, Wrench, ShieldCheck, Info, Edit, Trash2, Save, X, XCircle, UserPlus } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { useAuthStore } from '../../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import { useQuery } from '@tanstack/react-query';
import ticketService from '../services/ticketService';
import api from '../../../services/apiClient';
import AssignTechnicianModal from '../components/AssignTechnicianModal';

// Safe date formatter — prevents RangeError when createdAt is null/invalid
const safeFormat = (dateVal, fmt, fallback = 'N/A') => {
  if (!dateVal) return fallback;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return fallback;
  return format(d, fmt);
};

// Robust date parser for backend timestamps (ISO strings or Jackson arrays)
const parseBackendDate = (dateVal) => {
  if (!dateVal) return null;
  if (Array.isArray(dateVal)) {
    // Handle Jackson array format: [year, month, day, hour, minute, second]
    const [year, month, day, hour, minute] = dateVal;
    return new Date(year, month - 1, day, hour, minute);
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
};

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: ticket, isLoading, error } = useTicket(id);
  const {
    addComment,
    updateStatus,
    uploadAttachments,
    removeAttachment,
    renameAttachment,
    updateTicket,
    deleteTicket,
    isLoading: isActionLoading
  } = useTicketActions();
  const user = useAuthStore(s => s.user);

  const [isEditing, setIsEditing] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Fetch technicians for assignment (Admin only)
  const { data: technicians = [], isLoading: isLoadingTechs } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const res = await api.get('/api/admin/technicians');
      return res.data.data ?? [];
    },
    enabled: !!(user?.role === 'ADMIN'),
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    resourceId: '',
    preferredContact: ''
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        resourceId: ticket.resourceId || '',
        preferredContact: ticket.preferredContact || 'EMAIL'
      });
    }
  }, [ticket]);

  const isOwner = (user?.userId === ticket?.userId || user?.id === ticket?.userId) || (ticket?.userId === 'USER_123'); // Added fallback for mock testing
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const canUpload = isOwner && !isAdmin && !isTechnician;

  const createdAt = parseBackendDate(ticket?.createdAt);
  const isWithinHour = createdAt && differenceInMinutes(new Date(), createdAt) < 60;
  const canModify = isAdmin || (isOwner && isWithinHour);

  // Diagnostic Logs (Development)
  console.log('[TicketDetail] Diagnostics:', {
    userId: user?.userId || user?.id,
    ticketUserId: ticket?.userId,
    isOwner,
    isAdmin,
    rawCreatedAt: ticket?.createdAt,
    parsedCreatedAt: createdAt,
    isWithinHour,
    canModify
  });

  const handleUpdate = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Title, description and category are required');
      return;
    }
    try {
      await updateTicket({ id: ticket.id, data: formData });
      setIsEditing(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAssign = async (techId) => {
    if (!techId) return;
    try {
      await ticketService.assignTechnician(ticket.id, techId);
      toast.success('Technician assigned successfully');
      setIsAssignModalOpen(false);
      navigate('/admin/tickets');
    } catch (err) {
      toast.error('Failed to assign technician');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      try {
        await deleteTicket(ticket.id);
        navigate('/tickets');
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  if (isLoading) return (
    <div className="container mx-auto p-8 space-y-8 max-w-5xl">
      <Skeleton className="h-10 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );

  if (error || !ticket) return (
    <div className="container mx-auto p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <Info className="w-10 h-10 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold">Ticket Not Found</h2>
      <p className="text-muted-foreground mt-2">The ticket you are looking for doesn't exist or has been removed.</p>
      <Button variant="default" className="mt-6" onClick={() => navigate('/tickets')}>
        Return to List
      </Button>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-12 space-y-10 max-w-6xl"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <Button variant="ghost" className="group" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Button>

        {canModify && !isEditing && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2 font-bold px-4 hover:bg-primary/5 hover:text-primary border-primary/20 transition-all"
              onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
            >
              <Edit className="w-4 h-4" />
              Edit Ticket
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2 font-bold px-4 text-destructive border-destructive/20 hover:bg-destructive/5 hover:border-destructive transition-all"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-6">
              <div className="space-y-1 flex-1">
                <span className="text-xs font-bold text-primary/60 uppercase tracking-tighter">Reference #{ticket.id?.slice(-8).toUpperCase()}</span>
                {isEditing ? (
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-2xl font-black h-14 mt-2"
                    placeholder="Ticket Title"
                  />
                ) : (
                  <h1 className="text-4xl font-black tracking-tight leading-tight">{ticket.title}</h1>
                )}
              </div>
              {!isEditing && (
                <div className="flex gap-2">
                  <TicketStatusBadge status={ticket.status} />
                  <TicketPriorityBadge priority={ticket.priority} />
                </div>
              )}
            </div>

            <Card className="border-none shadow-xl shadow-black/5 bg-gradient-to-br from-white to-slate-50">
              <CardContent className="pt-8">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                        <Select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="h-12"
                        >
                          <option value="IT">IT Support</option>
                          <option value="ELECTRICAL">Electrical</option>
                          <option value="FURNITURE">Furniture</option>
                          <option value="PLUMBING">Plumbing</option>
                          <option value="CLEANING">Cleaning</option>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Priority</label>
                        <Select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="h-12"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Location / Resource ID</label>
                      <Input
                        value={formData.resourceId}
                        onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                        className="h-12"
                        placeholder="Room number or equipment ID"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="min-h-[200px] text-lg"
                        placeholder="Detailed description..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleUpdate} disabled={isActionLoading} className="flex-1 h-12 font-bold gap-2">
                        <Save className="w-5 h-5" /> Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="h-12 px-6 font-bold gap-2">
                        <X className="w-5 h-5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-lg text-foreground/80 whitespace-pre-wrap leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-100 pt-8 text-sm">
                      <div className="flex flex-col gap-2">
                        <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><User className="w-4 h-4" /> Reported By</span>
                        <span className="font-bold flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary">U</div>
                          {ticket.userId}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date reported</span>
                        <span className="font-bold">{safeFormat(ticket.createdAt, 'MMM dd, yyyy', 'Recently reported')}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><Tag className="w-4 h-4" /> Category</span>
                        <span className="font-bold bg-muted px-2 py-0.5 rounded-md inline-block w-fit">{ticket.category}</span>
                      </div>
                      {ticket.resourceId && (
                        <div className="flex flex-col gap-2">
                          <span className="text-muted-foreground font-semibold flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Location/Asset</span>
                          <span className="font-bold">{ticket.resourceId}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.section>

          <motion.section variants={itemVariants}>
            <Card className="overflow-hidden border-none shadow-lg bg-card">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Visual Progress
                </CardTitle>
                <CardDescription>Track the lifecycle of your request in real-time</CardDescription>
              </CardHeader>
              <CardContent className="pt-10 pb-16">
                <TicketStatusFlow status={ticket.status} />

                <AnimatePresence>
                  {ticket.status === 'RESOLVED' && (ticket.resolutionNotes || ticket.rejectionReason) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-16 p-6 bg-green-50/50 text-green-900 border border-green-100 rounded-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wrench className="w-20 h-20 rotate-12" />
                      </div>
                      <h4 className="font-black text-lg flex items-center gap-2 mb-2 uppercase tracking-tight">
                        <Wrench className="w-5 h-5" /> Technician's Resolution Notes
                      </h4>
                      <p className="text-base leading-relaxed relative z-10">{ticket.resolutionNotes || ticket.rejectionReason}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Rejection reason */}
                <AnimatePresence>
                  {ticket.status === 'REJECTED' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-16 p-6 bg-red-50 text-red-900 border border-red-100 rounded-2xl relative overflow-hidden shadow-sm"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <XCircle className="w-20 h-20 rotate-12" />
                      </div>
                      <h4 className="font-black text-lg flex items-center gap-2 mb-2 uppercase tracking-tight">
                        <XCircle className="w-5 h-5" /> Rejection Reason
                      </h4>
                      <p className="text-base font-medium leading-relaxed relative z-10 italic">
                        {ticket.rejectionReason || ticket.resolutionNotes || "No specific reason provided by administrator."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.section>

          <motion.div variants={itemVariants}>
            <CommentThread
              comments={ticket.comments}
              onAddComment={(content) => addComment({ id: ticket.id, content })}
              onDeleteComment={(commentId) => console.log('Delete comment', commentId)}
              isSubmitting={isActionLoading}
            />
          </motion.div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <motion.div variants={itemVariants}>
            <AttachmentUploader
              attachments={ticket.attachments}
              onUpload={canUpload ? (files) => uploadAttachments({ id: ticket.id, files }) : null}
              onRemove={canUpload || isAdmin ? (attachmentId) => removeAttachment({ id: ticket.id, attachmentId }) : null}
              onRename={canUpload || isAdmin ? (attachmentId, newName) => renameAttachment({ id: ticket.id, attachmentId, newName }) : null}
              isUploading={isActionLoading}
              readOnly={!canUpload}
            />
          </motion.div>

          {(isTechnician || isAdmin) && ticket.status !== 'RESOLVED' && ticket.status !== 'REJECTED' && ticket.status !== 'CLOSED' && (
            <motion.div variants={itemVariants}>
              <Card className="border-primary/20 bg-primary/[0.02] shadow-primary/5">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{isAdmin ? 'Admin Console' : 'Technician Panel'}</CardTitle>
                  <CardDescription>Actions available for {isAdmin ? 'administrators' : 'technicians'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(ticket.status === 'OPEN' || ticket.status === 'ASSIGNED') && (
                    <Button
                      className="w-full h-12 font-bold shadow-lg shadow-primary/20"
                      onClick={() => updateStatus({ id: ticket.id, status: 'IN_PROGRESS' })}
                      disabled={isActionLoading}
                    >
                      Take Ownership & Start
                    </Button>
                  )}
                  {ticket.status === 'IN_PROGRESS' && (
                    <Button
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200"
                      onClick={() => {
                        const resolutionNotes = window.prompt("Resolution Notes:");
                        if (resolutionNotes) updateStatus({ id: ticket.id, status: 'RESOLVED', notes: resolutionNotes });
                      }}
                      disabled={isActionLoading}
                    >
                      Complete & Resolve
                    </Button>
                  )}
                  {isAdmin && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS' || ticket.status === 'ASSIGNED') && (
                    <Button
                      variant="outline"
                      className="w-full h-12 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 font-bold shadow-sm"
                      onClick={() => setIsAssignModalOpen(true)}
                      disabled={isActionLoading}
                    >
                      <UserPlus className="w-5 h-5 mr-2" /> {ticket.status === 'ASSIGNED' ? 'Re-assign Technician' : 'Assign Technician'}
                    </Button>
                  )}
                  {isAdmin && (
                    <Button
                      variant="outline"
                      className="w-full h-10 text-red-600 border-red-100 hover:bg-red-50 font-semibold"
                      onClick={() => {
                        const reason = window.prompt("Rejection Reason:");
                        if (reason) updateStatus({ id: ticket.id, status: 'REJECTED', notes: reason });
                      }}
                      disabled={isActionLoading}
                    >
                      Reject Application
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <AssignTechnicianModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        technicians={technicians}
        isLoadingFetch={isLoadingTechs}
        ticketTitle={ticket?.title}
        onAssign={handleAssign}
      />
    </motion.div>
  );
};

export default TicketDetailPage;