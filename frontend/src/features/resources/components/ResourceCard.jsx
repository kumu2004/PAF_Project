import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Edit2, Trash2, MapPin, Users, ArrowRight, Building2,
  FlaskConical, Users2, Projector, CheckCircle2, XCircle, PenTool, BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ResourcePlaceholder } from './ResourcePlaceholder';
import { canUserBookResourceType } from '../utils/resourcePermissions';

const typeConfig = {
  LECTURE_HALL: {
    icon: Building2,
    label: 'Lecture Hall',
    badgeClass: 'bg-blue-500/10 text-blue-700 border-blue-200',
  },
  LAB: {
    icon: FlaskConical,
    label: 'Laboratory',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  },
  MEETING_ROOM: {
    icon: Users2,
    label: 'Meeting Room',
    badgeClass: 'bg-violet-500/10 text-violet-700 border-violet-200',
  },
  EQUIPMENT: {
    icon: Projector,
    label: 'Equipment',
    badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-200',
  },
  LIBRARY: {
    icon: BookOpen,
    label: 'Library',
    badgeClass: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
  },
  STUDY_SPACE: {
    icon: BookOpen,
    label: 'Study Space',
    badgeClass: 'bg-teal-500/10 text-teal-700 border-teal-200',
  },
};

const statusConfig = {
  ACTIVE: {
    icon: CheckCircle2,
    label: 'Active',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  UNDER_MAINTENANCE: {
    icon: PenTool,
    label: 'Maintenance',
    className: 'bg-amber-500/10 text-amber-600 border-amber-200',
    dot: 'bg-amber-500',
  },
  OUT_OF_SERVICE: {
    icon: XCircle,
    label: 'Out of Service',
    className: 'bg-rose-500/10 text-rose-600 border-rose-200',
    dot: 'bg-rose-500',
  },
};

export function ResourceCard({
  resource,
  showActions = false,
  showBookCta = false,
  showStatusBadge = false,
  onDelete,
  onEdit,
  compact = false
}) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isLecturer = user?.role === 'LECTURER';
  const isTechnician = user?.role === 'TECHNICIAN';

  const type = typeConfig[resource.type] || typeConfig.LECTURE_HALL;
  const status = statusConfig[resource.status] || statusConfig.ACTIVE;
  const TypeIcon = type.icon;

  const getDetailPath = (resourceId) => {
    if (isAdmin) return `/admin/resources/${resourceId}`;
    if (isLecturer) return `/lecturer/resources/${resourceId}`;
    if (isTechnician) return `/technician/resources/${resourceId}`;
    return `/student/resources/${resourceId}`;
  };

  return (
    <Card className="group overflow-hidden rounded-2xl border border-border/50
                     hover:shadow-xl hover:shadow-primary/5 transition-all duration-300
                     hover:-translate-y-1 bg-card">

      {/* Image / Placeholder Section */}
      <div className="relative h-48 sm:h-52 overflow-hidden">
        {resource.imageUrl ? (
          <div className="w-full h-full relative group-hover:scale-110 transition-transform duration-700">
            <img
              src={resource.imageUrl}
              alt={resource.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          </div>
        ) : (
          <ResourcePlaceholder type={resource.type} />
        )}

        {/* Status Badge — top right */}
        {showStatusBadge && (
          <div className="absolute top-4 right-4">
            <Badge variant="outline"
              className={`${status.className} backdrop-blur-xl bg-white/40 dark:bg-black/40
                               text-[10px] font-black uppercase tracking-widest px-2.5 py-1 border-white/20
                               shadow-[0_4px_12px_rgba(0,0,0,0.1)]`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
              {status.label}
            </Badge>
          </div>
        )}

        {/* Type Badge — top left */}
        <div className="absolute top-4 left-4">
          <Badge variant="outline"
            className={`${type.badgeClass} backdrop-blur-xl bg-white/40 dark:bg-black/40
                            text-[10px] font-black uppercase tracking-widest px-2.5 py-1 border-white/20
                            shadow-[0_4px_12px_rgba(0,0,0,0.1)]`}>
            <TypeIcon className="w-3.5 h-3.5 mr-1" />
            {type.label}
          </Badge>
        </div>

        {/* Capacity indicator — bottom right */}
        <div className="absolute bottom-4 right-4">
          <Badge className="bg-black/40 text-white backdrop-blur-xl border border-white/10
                           text-[10px] font-bold gap-1 px-2 py-0.5 shadow-sm">
            <Users className="w-3 h-3" />
            {resource.capacity}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 space-y-3">
        {/* Title & Location */}
        <div>
          <h3 className="text-lg font-bold tracking-tight line-clamp-1
                         group-hover:text-primary transition-colors">
            {resource.name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{resource.location}</span>
          </div>
        </div>

        {/* Description */}
        {!compact && resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {resource.description}
          </p>
        )}

        {/* Equipment chips */}
        {resource.equipment?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resource.equipment.slice(0, compact ? 2 : 3).map((item) => (
              <Badge key={item} variant="secondary"
                className="text-[11px] font-normal px-2 py-0.5">
                {item}
              </Badge>
            ))}
            {resource.equipment.length > (compact ? 2 : 3) && (
              <Badge variant="secondary"
                className="text-[11px] font-normal px-2 py-0.5">
                +{resource.equipment.length - (compact ? 2 : 3)} more
              </Badge>
            )}
          </div>
        )}

        {/* Amenities chips */}
        {!compact && resource.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resource.amenities.slice(0, 3).map((item) => (
              <Badge key={item} variant="outline"
                className="text-[11px] font-normal px-2 py-0.5 text-muted-foreground">
                {item}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => navigate(getDetailPath(resource.id))}
          >
            View Details
          </Button>

          {resource.status === 'ACTIVE' && showBookCta && canUserBookResourceType(user?.role, resource.type) && (
            <Button
              size="sm"
              className="flex-1 text-xs gap-1"
              onClick={() => {
                const rId = resource?.id || resource?._id;
                if (!rId) return;
                navigate(`/bookings/new?resourceId=${rId}`);
              }}
            >
              Book Now <ArrowRight className="w-3 h-3" />
            </Button>
          )}

          {showActions && (
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-primary/5 hover:border-primary/40 transition-colors"
                onClick={() => onEdit?.(resource)}
                title="Edit resource"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors"
                onClick={() => onDelete?.(resource?.id || resource?._id)}
                title="Delete resource"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
