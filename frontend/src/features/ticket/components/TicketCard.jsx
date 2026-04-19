import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import TicketStatusBadge from './TicketStatusBadge';
import TicketPriorityBadge from './TicketPriorityBadge';
import { formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { MessageSquare, Paperclip, Clock, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';
import { useTicketActions } from '../hooks/useTicketActions';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

const parseBackendDate = (dateVal) => {
  if (!dateVal) return null;
  if (Array.isArray(dateVal)) {
    const [year, month, day, hour, minute] = dateVal;
    return new Date(year, month - 1, day, hour, minute);
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
};

const TicketCard = ({ ticket }) => {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { deleteTicket } = useTicketActions();

  const isOwner = (user?.userId === ticket?.userId || user?.id === ticket?.userId) || (ticket?.userId === 'USER_123');
  const isAdmin = user?.role === 'ADMIN';

  // Improvement: 1-hour grace period for owners to edit/delete
  const createdAt = parseBackendDate(ticket.createdAt);
  const isWithinHour = createdAt && differenceInMinutes(new Date(), createdAt) < 60;
  const canModify = isAdmin || (isOwner && isWithinHour);

  // Diagnostic Logs (Development)
  if (isOwner) {
    console.log(`[TicketCard #${ticket.id.substring(0,8)}] Diagnostics:`, {
      isOwner,
      isWithinHour,
      canModify,
      createdAt
    });
  }

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(ticket.id);
      } catch (error) {
        // Handled by mutation
      }
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/tickets/${ticket.id}/edit`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="group overflow-hidden border-none shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 bg-white/70 backdrop-blur-xl relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-indigo-400 to-accent opacity-0 group-hover:opacity-100 transition-opacity" />

        <CardHeader className="pb-4 pt-6 px-6">
          <div className="flex justify-between items-start gap-4 mb-3">
            <TicketStatusBadge status={ticket.status} />
            <div className="flex items-center gap-2">
              {canModify && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={handleEdit}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
          </div>
          <CardTitle className="text-xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary">
            <Link to={`/tickets/${ticket.id}`} className="block">
              {ticket.title}
            </Link>
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">{ticket.category}</span>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {ticket.createdAt && !isNaN(new Date(ticket.createdAt).getTime())
                ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })
                : 'Recent'}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-2">
          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed font-medium">
            {ticket.description}
          </p>
        </CardContent>

        <CardFooter className="px-6 py-5 mt-4 border-t border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-bold">{ticket.comments?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
              <Paperclip className="w-4 h-4" />
              <span className="text-xs font-bold">{ticket.attachments?.length || 0}</span>
            </div>
          </div>

          <Link
            to={`/tickets/${ticket.id}`}
            className="flex items-center gap-1 text-xs font-black text-primary uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0"
          >
            View detail <ChevronRight className="w-4 h-4" />
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TicketCard;