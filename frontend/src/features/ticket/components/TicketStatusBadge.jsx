import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';

const TicketStatusBadge = ({ status }) => {
  if (!status) return null;
  const variants = {
    OPEN: 'bg-blue-500/10 text-blue-600 border-blue-200/50 shadow-sm shadow-blue-500/5',
    ASSIGNED: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50 shadow-sm shadow-indigo-500/5',
    IN_PROGRESS: 'bg-amber-500/10 text-amber-600 border-amber-200/50 shadow-sm shadow-amber-500/5',
    RESOLVED: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50 shadow-sm shadow-emerald-500/5',
    CLOSED: 'bg-slate-500/10 text-slate-600 border-slate-200/50',
    REJECTED: 'bg-rose-500/10 text-rose-600 border-rose-200/50 shadow-sm shadow-rose-500/5',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-black uppercase tracking-widest text-[10px] py-1 px-3 rounded-full border backdrop-blur-sm transition-all flex items-center gap-2",
        variants[status] || variants.OPEN
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status === 'ASSIGNED' ? 'ASSIGNED TECHNICIAN' : (status ?? '').replace('_', ' ')}
    </Badge>
  );
};

export default TicketStatusBadge;