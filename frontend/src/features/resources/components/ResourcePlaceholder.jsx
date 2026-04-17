import { Building2, FlaskConical, Users, Projector, BookOpen } from 'lucide-react';

const typeConfig = {
  LECTURE_HALL: {
    icon: Building2,
    gradient: 'from-blue-500/20 via-blue-400/10 to-indigo-500/20',
    iconColor: 'text-blue-500',
    label: 'Lecture Hall',
  },
  LAB: {
    icon: FlaskConical,
    gradient: 'from-emerald-500/20 via-emerald-400/10 to-teal-500/20',
    iconColor: 'text-emerald-500',
    label: 'Laboratory',
  },
  MEETING_ROOM: {
    icon: Users,
    gradient: 'from-violet-500/20 via-violet-400/10 to-purple-500/20',
    iconColor: 'text-violet-500',
    label: 'Meeting Room',
  },
  EQUIPMENT: {
    icon: Projector,
    gradient: 'from-amber-500/20 via-amber-400/10 to-orange-500/20',
    iconColor: 'text-amber-500',
    label: 'Equipment',
  },
  LIBRARY: {
    icon: BookOpen,
    gradient: 'from-indigo-500/20 via-indigo-400/10 to-blue-500/20',
    iconColor: 'text-indigo-500',
    label: 'Library',
  },
  STUDY_SPACE: {
    icon: BookOpen,
    gradient: 'from-teal-500/20 via-teal-400/10 to-cyan-500/20',
    iconColor: 'text-teal-500',
    label: 'Study Space',
  },
};

/**
 * Renders a beautiful gradient placeholder when no image is available.
 * Shows a type-specific icon and label.
 */
export function ResourcePlaceholder({ type = 'LECTURE_HALL', className = '' }) {
  const config = typeConfig[type] || typeConfig.LECTURE_HALL;
  const Icon = config.icon;

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${config.gradient}
                     flex flex-col items-center justify-center gap-2 ${className}`}>
      {/* Background pattern — grid dots */}
      <div className="absolute inset-0 opacity-[0.04]"
           style={{
             backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
             backgroundSize: '16px 16px',
           }} />

      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-sm
                       flex items-center justify-center shadow-sm">
          <Icon className={`w-7 h-7 ${config.iconColor}`} />
        </div>
        <span className={`text-xs font-semibold uppercase tracking-widest ${config.iconColor} opacity-60`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
