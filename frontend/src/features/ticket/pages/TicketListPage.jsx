import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTickets } from '../hooks/useTickets';
import TicketCard from '../components/TicketCard';
import { Button, buttonVariants } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Skeleton } from '../../../components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '../../../components/ui/dropdown-menu';
import TicketStatusBadge from '../components/TicketStatusBadge';
import TicketPriorityBadge from '../components/TicketPriorityBadge';
import { formatDistanceToNow, format } from 'date-fns';
import { Plus, Search, Filter, History, LayoutGrid, List as ListIcon, Play, UserPlus, XCircle, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTicketActions } from '../hooks/useTicketActions';
import ticketService from '../services/ticketService';
import { cn } from '../../../lib/utils';
import { useAuthStore } from '../../../store/authStore';
import api from '../../../services/apiClient';
import { toast } from 'sonner';
import AssignTechnicianModal from '../components/AssignTechnicianModal';

const TicketListPage = ({ isAdmin: isAdminProp, isAssigned = false }) => {
  const user = useAuthStore(state => state.user);
  const isAdmin = isAdminProp || user?.role === 'ADMIN';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [viewMode, setViewMode] = useState(user?.role === 'ADMIN' ? 'table' : 'grid');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTicketForAssign, setSelectedTicketForAssign] = useState(null);

  // Fetch technicians for assignment (Admin only)
  const { data: technicians = [], isLoading: isLoadingTechs } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const res = await api.get('/api/admin/technicians');
      // Returns ApiResponse<List<AdminUserDto>> => { success, message, data: [...] }
      return res.data.data ?? [];
    },
    enabled: isAdmin,
  });

  const { data: tickets, isLoading, error } = useTickets({ search, status, priority, isAssigned });
  const { updateStatus } = useTicketActions();
  const queryClient = useQueryClient();

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }
    
    try {
      await ticketService.deleteTicket(ticketId);
      toast.success('Ticket deleted successfully');
      // Invalidate queries instead of reloading
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    } catch (err) {
      toast.error('Failed to delete ticket');
      console.error(err);
    }
  };

  const handleAssign = async (ticketId, techId) => {
    if (!techId) return;
    try {
      await ticketService.assignTechnician(ticketId, techId);
      toast.success('Technician assigned successfully');
      // Invalidate queries to refresh the list smoothly
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setIsAssignModalOpen(false);
    } catch (err) {
      toast.error('Failed to assign technician');
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 container mx-auto px-4 py-12 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
            <History className="w-4 h-4" /> {isAssigned ? 'Work Queue' : (isAdmin ? 'Service Requests' : 'My Service Requests')}
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            {isAssigned ? 'Assigned Tickets' : (isAdmin ? 'Incident Tickets' : 'My Tickets')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {isAssigned 
              ? 'Tickets assigned to you. Review and update their status to keep the system current.'
              : 'Track and manage your campus maintenance requests with ease.'
            }
          </p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}>
              {viewMode === 'grid' ? <ListIcon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
           </Button>
           {!isAdmin && user?.role !== 'TECHNICIAN' && (
             <Link 
              to="/tickets/new" 
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "h-14 px-8 text-lg font-black bg-gradient-to-r from-orange-500 to-amber-600 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/40 hover:scale-105 transition-all active:scale-95 rounded-2xl flex items-center gap-2"
              )}
             >
              <Plus className="w-6 h-6" />
              <span>New Ticket</span>
            </Link>
           )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-card p-6 rounded-2xl border border-border mt-8 shadow-sm relative">
        <div className="lg:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by title, description or category..." 
            className="pl-11 h-12 bg-background/50 border-border/50 focus-visible:ring-primary/30 text-base rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <Select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="h-12 border-border/50 bg-secondary/80 text-primary rounded-xl focus:ring-primary/30 font-black uppercase tracking-tighter text-xs"
          >
            <option value="" className="bg-card text-primary font-bold">Status: All</option>
            <option value="OPEN" className="bg-card text-foreground">Open</option>
            <option value="IN_PROGRESS" className="bg-card text-foreground">In Progress</option>
            <option value="RESOLVED" className="bg-card text-foreground">Resolved</option>
            <option value="CLOSED" className="bg-card text-foreground">Closed</option>
            <option value="REJECTED" className="bg-card text-foreground">Rejected</option>
          </Select>
          <Select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value)} 
            className="h-12 border-border/50 bg-secondary/80 text-primary rounded-xl focus:ring-primary/30 font-black uppercase tracking-tighter text-xs"
          >
            <option value="" className="bg-card text-primary font-bold">Priority: All</option>
            <option value="LOW" className="bg-card text-foreground">Low</option>
            <option value="MEDIUM" className="bg-card text-foreground">Medium</option>
            <option value="HIGH" className="bg-card text-foreground">High</option>
            <option value="CRITICAL" className="bg-card text-foreground">Critical</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="space-y-4 p-6 rounded-2xl border bg-card">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-[60%]" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-[40%]" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
              </div>
              <div className="pt-4 border-t flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-destructive/5 rounded-3xl border border-destructive/10"
        >
          <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-destructive">Connection Error</h2>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            We couldn't reach the server. Please check your internet or refresh the page.
          </p>
          <Button variant="outline" className="mt-6 font-bold" onClick={() => window.location.reload()}>
            Try Refreshing
          </Button>
        </motion.div>
      ) : tickets?.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 bg-muted/20 border-2 border-dashed rounded-[32px] flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
            <Plus className="w-12 h-12 text-primary/30" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {isAssigned ? 'No assigned tickets' : 'Zero tickets found'}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            {isAssigned 
              ? 'No tickets have been assigned to you at this time. Check back soon for new work items.'
              : 'Any campus issues or service requests reported will appear here. Start by creating a report.'
            }
          </p>
          {user?.role !== 'TECHNICIAN' && !isAdmin && (
            <Link 
              to="/tickets/new" 
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "mt-8 h-14 px-12 rounded-2xl font-black text-lg bg-gradient-to-r from-orange-500 to-amber-600 shadow-2xl shadow-orange-500/30 hover:scale-105 transition-all inline-flex items-center justify-center"
              )}
            >
              Report an Incident Now
            </Link>
          )}
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {viewMode === 'table' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-[2rem] border border-border/50 shadow-2xl shadow-primary/5 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/50">
                      <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Reference</th>
                      <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground w-1/3">Subject</th>
                      <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Category</th>
                      <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                      <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground">Priority</th>
                      <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Details</th>
                      {isAdmin && <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-muted-foreground text-right px-10">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="group hover:bg-primary/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <code className="text-[10px] font-black bg-primary/5 text-primary px-2 py-1 rounded-md uppercase">
                            #{ticket.id.substring(0, 8)}
                          </code>
                          <div className="text-[10px] text-muted-foreground font-medium mt-1">
                            {format(new Date(), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <Link to={`/tickets/${ticket.id}`} className="block group/link">
                            <div className="font-bold text-foreground group-hover/link:text-primary transition-colors line-clamp-1">{ticket.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{ticket.description}</div>
                          </Link>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-xs font-bold text-foreground/80 bg-muted px-2.5 py-1 rounded-lg border border-border/50">{ticket.category}</span>
                        </td>
                        <td className="px-6 py-5"><TicketStatusBadge status={ticket.status} /></td>
                        <td className="px-6 py-5"><TicketPriorityBadge priority={ticket.priority} /></td>
                        <td className="px-6 py-5 text-center">
                          <Link 
                            to={`/tickets/${ticket.id}`}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-5 text-right px-8">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-full transition-colors outline-none focus:ring-2 focus:ring-primary/20">
                                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-border/50 backdrop-blur-xl">
                                  <div className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Manage Lifecycle</div>
                                  <DropdownMenuItem 
                                    className="rounded-xl gap-3 py-3 cursor-pointer focus:bg-primary/[0.05] focus:text-primary"
                                    onClick={() => updateStatus({ id: ticket.id, status: 'IN_PROGRESS' })}
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                      <Play className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-bold">Start Working</span>
                                      <span className="text-[10px] opacity-70">Mark as In Progress</span>
                                    </div>
                                  </DropdownMenuItem>
                                  
                                    <DropdownMenuItem 
                                      className="rounded-xl gap-3 py-3 cursor-pointer focus:bg-emerald-50 focus:text-emerald-600"
                                      onClick={() => {
                                        setSelectedTicketForAssign(ticket);
                                        setIsAssignModalOpen(true);
                                      }}
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-emerald-100/50 flex items-center justify-center">
                                        <UserPlus className="w-4 h-4" />
                                      </div>
                                      <div className="flex flex-col flex-1 text-left">
                                        <span className="font-bold">Assign Technician</span>
                                        <span className="text-[10px] opacity-70">Staff selection modal</span>
                                      </div>
                                    </DropdownMenuItem>

                                  <DropdownMenuSeparator className="my-1 bg-border/50" />
                                  
                                    <DropdownMenuItem 
                                      className="rounded-xl gap-3 py-3 cursor-pointer focus:bg-red-50 focus:text-red-600"
                                      onClick={() => {
                                        const reason = window.prompt("Reason for rejection:");
                                        if (reason) updateStatus({ id: ticket.id, status: 'REJECTED', notes: reason });
                                      }}
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-red-100/50 flex items-center justify-center">
                                        <XCircle className="w-4 h-4 text-red-500" />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="font-bold">Reject Ticket</span>
                                        <span className="text-[10px] opacity-70 text-red-400">Cancel request</span>
                                      </div>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="my-1 bg-border/50" />

                                    <DropdownMenuItem 
                                      className="rounded-xl gap-3 py-3 cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                                      onClick={() => handleDelete(ticket.id)}
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </div>
                                      <div className="flex flex-col text-left">
                                        <span className="font-bold text-destructive">Delete Ticket</span>
                                        <span className="text-[10px] opacity-70">Permanently remove</span>
                                      </div>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className={cn(
                "grid gap-8",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 lg:max-w-4xl mx-auto"
              )}
            >
              {tickets.map((ticket, index) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <AssignTechnicianModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        technicians={technicians}
        isLoadingFetch={isLoadingTechs}
        ticketTitle={selectedTicketForAssign?.title}
        onAssign={(techId) => {
          handleAssign(selectedTicketForAssign.id, techId);
          setIsAssignModalOpen(false);
        }}
      />
    </div>
  );
};

export default TicketListPage;
