import { Badge } from '../ui/badge';

const STATUS_CONFIG = {
  PENDING: { variant: 'outline', className: 'text-amber-600 border-amber-300 bg-amber-50' },
  APPROVED: { variant: 'outline', className: 'text-emerald-700 border-emerald-300 bg-emerald-50' },
  REJECTED: { variant: 'outline', className: 'text-red-600 border-red-300 bg-red-50' },
  CANCELLED: { variant: 'outline', className: 'text-slate-600 border-slate-300 bg-slate-50' },
  OPEN: { variant: 'outline', className: 'text-blue-600 border-blue-300 bg-blue-50' },
  IN_PROGRESS: { variant: 'outline', className: 'text-sky-600 border-sky-300 bg-sky-50' },
  RESOLVED: { variant: 'outline', className: 'text-emerald-700 border-emerald-300 bg-emerald-50' },
  CLOSED: { variant: 'outline', className: 'text-slate-600 border-slate-300 bg-slate-50' },
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { variant: 'outline', className: 'text-gray-600 border-gray-300 bg-gray-50' };
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
}
