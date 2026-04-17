import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';
import { AlertCircle, AlertTriangle, Info, Zap } from 'lucide-react';

const TicketPriorityBadge = ({ priority }) => {
  if (!priority) return null;
  const configs = {
    LOW: { color: 'bg-blue-500/10 text-blue-600 border-blue-200/50', icon: Info },
    MEDIUM: { color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50', icon: Info },
    HIGH: { color: 'bg-orange-500/10 text-orange-600 border-orange-200/50', icon: AlertTriangle },
    CRITICAL: { color: 'bg-rose-500/10 text-rose-600 border-rose-200/50 shadow-sm shadow-rose-500/10', icon: Zap },
  };

  const config = configs[priority] || configs.MEDIUM;
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-black text-[10px] uppercase tracking-wider rounded-lg gap-2 px-2.5 py-1 border shadow-none transition-all hover:scale-105",
        config.color
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {priority}
    </Badge>
  );
};

export default TicketPriorityBadge;