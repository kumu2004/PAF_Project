import { useNavigate } from 'react-router-dom';
import { MapPin, Users, ExternalLink, Building2, FlaskConical, Users2, Projector } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useResources } from '../hooks/useResources';
import { useAuthStore } from '@/store/authStore';

const typeIcons = {
  LECTURE_HALL: Building2,
  LAB: FlaskConical,
  MEETING_ROOM: Users2,
  EQUIPMENT: Projector,
};

const typeColors = {
  LECTURE_HALL: 'text-blue-600 bg-blue-500/10',
  LAB: 'text-emerald-600 bg-emerald-500/10',
  MEETING_ROOM: 'text-violet-600 bg-violet-500/10',
  EQUIPMENT: 'text-amber-600 bg-amber-500/10',
};

/**
 * A compact resource card designed to be embedded in other pages
 * (e.g., ticket detail showing the affected resource, dashboard quick-view).
 * Fetches resource data by ID if not provided directly.
 */
export function ResourceMiniCard({ resourceId, resource: propResource }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isLecturer = user?.role === 'LECTURER';
  const isTechnician = user?.role === 'TECHNICIAN';

  const getDetailPath = (currentResourceId) => {
    if (isAdmin) return `/admin/resources/${currentResourceId}`;
    if (isLecturer) return `/lecturer/resources/${currentResourceId}`;
    if (isTechnician) return `/technician/resources/${currentResourceId}`;
    return `/student/resources/${currentResourceId}`;
  };
  const { data: fetchedResource, isLoading } = useResources(
    propResource ? {} : { id: resourceId }
  );

  const resource = propResource || fetchedResource;

  if (isLoading) {
    return (
      <div className="animate-pulse flex gap-3 p-3">
        <div className="w-10 h-10 bg-muted rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="p-3 text-sm text-muted-foreground bg-muted/30 rounded-lg">
        Resource not found
      </div>
    );
  }

  const TypeIcon = typeIcons[resource.type] || Building2;
  const colorClass = typeColors[resource.type] || typeColors.LECTURE_HALL;

  return (
    <button
      onClick={() => navigate(getDetailPath(resource.id))}
      className="w-full flex items-center gap-3 p-3 rounded-xl
                 bg-muted/30 hover:bg-muted/50 transition-colors
                 border border-border/50 text-left group">

      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <TypeIcon className="w-5 h-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {resource.name}
          </p>
          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {resource.location}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {resource.capacity}
          </span>
        </div>
      </div>

      {/* Status */}
      <Badge variant="outline" className={`text-[10px] flex-shrink-0 ${
        resource.status === 'ACTIVE'
          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
          : 'bg-rose-500/10 text-rose-600 border-rose-200'
      }`}>
        {resource.status === 'ACTIVE' ? 'Active' : 'OOS'}
      </Badge>
    </button>
  );
}
