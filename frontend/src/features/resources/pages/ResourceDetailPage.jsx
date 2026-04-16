import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Users, Tag, Clock, AlertCircle,
  Building2, FlaskConical, Users2, Projector, BookOpen,
  CheckCircle2, XCircle, Calendar, ArrowRight, Wifi,
  Snowflake, PenTool, Volume2, Plug, Tv, Video, Camera,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResources, useUpdateResourceStatus } from '../hooks/useResources';
import { useAuthStore } from '@/store/authStore';
import { RoomBlueprint } from '../components/RoomBlueprint';
import { ResourcePlaceholder } from '../components/ResourcePlaceholder';

/* ── Type / Status config ──────────────────────────── */

const typeConfig = {
  LECTURE_HALL: { icon: Building2, label: 'Lecture Hall', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  LAB: { icon: FlaskConical, label: 'Laboratory', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  MEETING_ROOM: { icon: Users2, label: 'Meeting Room', color: 'text-violet-600', bg: 'bg-violet-500/10' },
  EQUIPMENT: { icon: Projector, label: 'Equipment', color: 'text-amber-600', bg: 'bg-amber-500/10' },
  LIBRARY:    { icon: BookOpen, label: 'Library', color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
  STUDY_SPACE:{ icon: BookOpen, label: 'Study Space', color: 'text-teal-600', bg: 'bg-teal-500/10' },
};

const statusConfig = {
  ACTIVE: { icon: CheckCircle2, label: 'Active', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
  OUT_OF_SERVICE: { icon: XCircle, label: 'Out of Service', class: 'bg-rose-500/10 text-rose-600 border-rose-200', dot: 'bg-rose-500' },
};

const equipmentIcons = {
  projector: Projector, wifi: Wifi, 'air conditioning': Snowflake, ac: Snowflake,
  whiteboard: PenTool, 'sound system': Volume2, microphone: Volume2,
  'power outlets': Plug, 'smart tv': Tv, recording: Video, webcam: Camera, camera: Camera,
};

function getEquipIcon(name) {
  const key = name.toLowerCase();
  for (const [k, Icon] of Object.entries(equipmentIcons)) {
    if (key.includes(k)) return Icon;
  }
  return Tag;
}

/* ── Page Component ───────────────────────────────── */

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isLecturer = user?.role === 'LECTURER';
  const basePath = isAdmin
    ? '/admin/resources'
    : isLecturer
      ? '/lecturer/resources'
      : isTechnician
        ? '/technician/resources'
        : '/student/resources';

  const { data: resource, isLoading, error } = useResources({ id });
  const updateStatusMutation = useUpdateResourceStatus();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="pt-6 flex gap-3 items-center">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <p className="text-rose-700 font-medium">Error loading resource details</p>
          </CardContent>
        </Card>
        <Button onClick={() => navigate(basePath)} className="mt-4" variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>
      </div>
    );
  }

  const type = typeConfig[resource.type] || typeConfig.LECTURE_HALL;
  const status = statusConfig[resource.status] || statusConfig.ACTIVE;
  const TypeIcon = type.icon;
  const nextStatus = resource.status === 'OUT_OF_SERVICE' ? 'ACTIVE' : 'OUT_OF_SERVICE';
  const statusActionLabel = resource.status === 'OUT_OF_SERVICE'
    ? 'Mark as Active'
    : 'Mark Out of Service';

  const handleAdminStatusToggle = () => {
    updateStatusMutation.mutate({ id: resource.id, status: nextStatus });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(basePath)} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Resources
        </Button>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={() => navigate(`/admin/resources/${id}/edit`)} variant="outline" size="sm">
              Edit Resource
            </Button>
          )}
          {resource.status === 'ACTIVE' &&
            !isTechnician &&
            !isAdmin &&
            (user?.role !== 'STUDENT' || ['MEETING_ROOM', 'EQUIPMENT', 'STUDY_SPACE'].includes(resource.type)) && (
              <Button size="sm" className="gap-1.5"
                onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}>
                <Calendar className="w-3.5 h-3.5" />
                Book This Resource
              </Button>
            )}
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden border border-border/50 shadow-sm">
        {resource.imageUrl ? (
          <img src={resource.imageUrl} alt={resource.name}
            className="w-full h-full object-cover" />
        ) : (
          <ResourcePlaceholder type={resource.type} />
        )}

        {/* Floating info overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline" className={`${type.bg} ${type.color} border-0 backdrop-blur-md bg-white/80 text-xs`}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {type.label}
                </Badge>
                <Badge variant="outline" className={`${status.class} backdrop-blur-md bg-white/80 text-xs gap-1.5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-white">{resource.name}</h1>
              <p className="text-white/80 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4" />
                {resource.location}
              </p>
            </div>
            <Badge className="bg-white/20 text-white backdrop-blur-md border-0 text-sm gap-1.5 px-3 py-1.5">
              <Users className="w-4 h-4" />
              {resource.capacity} seats
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {resource.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">About This Resource</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{resource.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Equipment & Amenities */}
          {(resource.equipment?.length > 0 || resource.amenities?.length > 0) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Equipment & Amenities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resource.equipment?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Equipment
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {resource.equipment.map((item) => {
                        const Icon = getEquipIcon(item);
                        return (
                          <div key={item}
                            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50
                                          border border-border/50">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {resource.amenities?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Amenities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {resource.amenities.map((item) => (
                        <Badge key={item} variant="outline" className="text-xs px-3 py-1">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Blueprint / Floor Plan */}
          <RoomBlueprint
            type={resource.type}
            capacity={resource.capacity}
            equipment={resource.equipment}
            amenities={resource.amenities}
          />

          {/* Operating Hours */}
          {resource.availabilityWindows?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {resource.availabilityWindows.map((window, idx) => (
                    <div key={idx}
                      className="flex justify-between items-center p-3 rounded-lg
                                    bg-muted/40 hover:bg-muted/60 transition-colors">
                      <span className="font-medium text-sm">{window.dayOfWeek}</span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {window.startTime} — {window.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column — Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {resource.status === 'ACTIVE' &&
                !isTechnician &&
                !isAdmin &&
                (user?.role !== 'STUDENT' || ['MEETING_ROOM', 'EQUIPMENT', 'STUDY_SPACE'].includes(resource.type)) && (
                  <Button className="w-full gap-2" size="sm"
                    onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}>
                    <Calendar className="w-4 h-4" />
                    Book This Resource
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </Button>
                )}
              {!isTechnician && !isAdmin && (
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <Clock className="w-4 h-4" />
                  Check Availability
                </Button>
              )}
              {isTechnician && (
                <Button className="w-full gap-2" size="sm"
                  onClick={() => navigate(`/tickets?resourceId=${resource.id}`)}>
                  <AlertCircle className="w-4 h-4" />
                  View Related Tickets
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Button>
              )}
              {isAdmin && (
                <>
                  <Button variant="outline" className="w-full gap-2" size="sm"
                    onClick={() => navigate(`/admin/resources/${id}/edit`)}>
                    Edit Details
                  </Button>
                  <Button variant="outline"
                    className="w-full gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    size="sm"
                    onClick={handleAdminStatusToggle}
                    disabled={updateStatusMutation.isPending}>
                    <XCircle className="w-4 h-4" />
                    {updateStatusMutation.isPending ? 'Updating...' : statusActionLabel}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Resource Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resource Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline" className={`${type.bg} ${type.color} border-0 text-xs`}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {type.label}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={`${status.class} text-xs gap-1`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-medium">{resource.capacity} seats</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{resource.location}</span>
              </div>
              {resource.createdAt && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium text-xs">
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {resource.updatedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium text-xs">
                    {new Date(resource.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-muted-foreground">ID</span>
                <code className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {resource.id?.slice(0, 12)}...
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Status Alert */}
          {resource.status !== 'ACTIVE' && (
            <Card className="border-rose-200 bg-rose-50/50 dark:bg-rose-950/20">
              <CardContent className="pt-6 flex gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-900 dark:text-rose-200">
                    Currently Unavailable
                  </p>
                  <p className="text-sm text-rose-800/80 dark:text-rose-300/80 mt-0.5">
                    This resource is currently marked as out of service and cannot be booked.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Role-Based Booking Alert for Students */}
          {user?.role === 'STUDENT' && ['LECTURE_HALL', 'LAB'].includes(resource.type) && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6 flex gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">
                    Faculty Reservation Only
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    This facility is reserved for lecture-based bookings by university faculty.
                    Students can view floor plans and details, but booking is restricted.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}