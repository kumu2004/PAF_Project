import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  MonitorPlay, Wifi, Snowflake, PenTool, Volume2, Plug,
  Tv, Video, Camera, Printer, Armchair, DoorOpen,
  Layout as LayoutIcon, Coffee, Zap
} from 'lucide-react';

const equipmentIcons = {
  projector: MonitorPlay,
  wifi: Wifi,
  'air conditioning': Snowflake,
  ac: Snowflake,
  whiteboard: PenTool,
  'sound system': Volume2,
  microphone: Volume2,
  'power outlets': Plug,
  'smart tv': Tv,
  recording: Video,
  webcam: Camera,
  camera: Camera,
  printer: Printer,
  chairs: Armchair,
};

function getIcon(name) {
  const key = name.toLowerCase();
  for (const [k, Icon] of Object.entries(equipmentIcons)) {
    if (key.includes(k)) return Icon;
  }
  return Plug;
}

const typeColors = {
  LECTURE_HALL: { stroke: '#2563eb', fill: '#f8fafc', accent: '#dbeafe', floor: '#f1f5f9' },
  LAB:          { stroke: '#059669', fill: '#f0fdf4', accent: '#dcfce7', floor: '#f0fdf4' },
  MEETING_ROOM: { stroke: '#7c3aed', fill: '#f5f3ff', accent: '#ede9fe', floor: '#f5f3ff' },
  EQUIPMENT:    { stroke: '#d97706', fill: '#fffbeb', accent: '#fef3c7', floor: '#fffbeb' },
  STUDY_SPACE:  { stroke: '#4f46e5', fill: '#f5f5ff', accent: '#e0e7ff', floor: '#f5f5ff' },
};

export function RoomBlueprint({ type = 'LECTURE_HALL', capacity = 30, equipment = [], amenities = [] }) {
  const colors = typeColors[type] || typeColors.LECTURE_HALL;
  const isRoom = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'STUDY_SPACE'].includes(type);

  return (
    <Card className="border-2 border-dashed overflow-hidden rounded-[2rem]"
          style={{ borderColor: colors.accent, backgroundColor: colors.fill }}>
      <CardHeader className="py-4 px-6 border-b" style={{ borderColor: colors.accent }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.stroke }} />
             <span className="text-[10px] font-black uppercase tracking-widest"
                   style={{ color: colors.stroke }}>
               Architectural Schematic
             </span>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold gap-1"
                 style={{ borderColor: colors.stroke, color: colors.stroke, backgroundColor: 'white' }}>
            Capacity: {capacity} Students
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative aspect-[4/3] w-full flex items-center justify-center p-8">
          {isRoom ? (
            <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-xl" aria-label="Room layout blueprint">
              {/* Floor Base */}
              <rect x="10" y="10" width="380" height="280" rx="12" fill={colors.floor} />
              
              {/* Walls */}
              <rect x="10" y="10" width="380" height="280" rx="12"
                    fill="none" stroke={colors.stroke} strokeWidth="3" />
              
              {/* Window Indicators */}
              <line x1="80" y1="10" x2="160" y2="10" stroke="#94a3b8" strokeWidth="4" />
              <line x1="240" y1="10" x2="320" y2="10" stroke="#94a3b8" strokeWidth="4" />
              <line x1="390" y1="80" x2="390" y2="160" stroke="#94a3b8" strokeWidth="4" />

              {/* Entrance Door */}
              <g transform="translate(10, 240)">
                 <path d="M0,0 Q30,0 30,30" fill="none" stroke={colors.stroke} strokeWidth="1" strokeDasharray="2,2" />
                 <line x1="0" y1="0" x2="0" y2="40" stroke={colors.stroke} strokeWidth="4" />
                 <text x="35" y="15" style={{ fontSize: '8px', fill: colors.stroke, fontWeight: 700 }}>ENTRANCE</text>
              </g>

              {/* TYPE-SPECIFIC LAYOUTS */}
              
              {/* 1. LECTURE HALL: Tiered Seating Rows */}
              {type === 'LECTURE_HALL' && (
                <g>
                  {/* Instructor Stage */}
                  <rect x="40" y="30" width="320" height="60" rx="8" fill="white" stroke={colors.stroke} strokeWidth="1" strokeOpacity="0.3" />
                  <text x="200" y="55" textAnchor="middle" style={{ fontSize: '10px', fill: colors.stroke, fontWeight: 900, opacity: 0.4 }}>PRIMARY LECTURE ZONE</text>
                  <rect x="180" y="65" width="40" height="15" rx="2" fill={colors.stroke} opacity="0.1" />
                  
                  {/* Rows */}
                  {[0, 1, 2].map((row) => (
                    <g key={row} transform={`translate(0, ${row * 50})`}>
                       {[0, 1, 2, 3, 4, 5].map((seat) => (
                         <rect key={seat} x={45 + seat * 55} y={120} width="45" height="25" rx="4" fill="white" stroke={colors.stroke} strokeWidth="0.5" strokeOpacity="0.2" />
                       ))}
                    </g>
                  ))}
                </g>
              )}

              {/* 2. LAB: Island-Style Workstations */}
              {type === 'LAB' && (
                <g>
                   {/* Central Islands */}
                   {[0, 1].map((row) => (
                     <g key={row} transform={`translate(0, ${row * 100})`}>
                        {[0, 1, 2].map((island) => (
                          <g key={island} transform={`translate(${island * 120}, 0)`}>
                             <rect x="40" y="50" width="80" height="40" rx="6" fill="white" stroke={colors.stroke} strokeWidth="1.5" />
                             {/* Equipment on desk */}
                             <circle cx="55" cy="65" r="4" fill={colors.stroke} opacity="0.2" />
                             <rect x="90" y="60" width="15" height="10" rx="1" fill={colors.stroke} opacity="0.1" />
                             {/* Stools */}
                             <circle cx="60" cy="40" r="6" fill={colors.accent} stroke={colors.stroke} strokeWidth="0.5" />
                             <circle cx="100" cy="40" r="6" fill={colors.accent} stroke={colors.stroke} strokeWidth="0.5" />
                             <circle cx="60" cy="100" r="6" fill={colors.accent} stroke={colors.stroke} strokeWidth="0.5" />
                             <circle cx="100" cy="100" r="6" fill={colors.accent} stroke={colors.stroke} strokeWidth="0.5" />
                          </g>
                        ))}
                     </g>
                   ))}
                </g>
              )}

              {/* 3. MEETING ROOM: Conference Table */}
              {type === 'MEETING_ROOM' && (
                <g transform="translate(200, 150)">
                   {/* Large Oval Table */}
                   <ellipse cx="0" cy="0" rx="140" ry="70" fill="white" stroke={colors.stroke} strokeWidth="2" />
                   <text x="0" y="5" textAnchor="middle" style={{ fontSize: '10px', fill: colors.stroke, fontWeight: 900, opacity: 0.3 }}>COLLABORATION TABLE</text>
                   
                   {/* Chairs around table */}
                   {Array.from({ length: 12 }).map((_, i) => {
                     const angle = (i * 360) / 12;
                     const rad = (angle * Math.PI) / 180;
                     const x = 160 * Math.cos(rad);
                     const y = 90 * Math.sin(rad);
                     return (
                        <rect key={i} x={x - 10} y={y - 10} width="20" height="20" rx="4" transform={`rotate(${angle + 90}, ${x}, ${y})`} fill={colors.accent} stroke={colors.stroke} strokeWidth="0.5" />
                     );
                   })}
                </g>
              )}

              {/* 4. STUDY SPACE: Pods & Hub Clusters */}
              {type === 'STUDY_SPACE' && (
                <g>
                   {/* Silent Pods along walls */}
                   {[0, 1, 2, 3].map((pod) => (
                     <rect key={pod} x={20} y={30 + pod * 45} width="40" height="35" rx="4" fill="white" stroke={colors.stroke} strokeWidth="1" strokeDasharray="2,1" />
                   ))}
                   
                   {/* Social Hub Clusters */}
                   {[0, 1].map((cluster) => (
                     <g key={cluster} transform={`translate(${150 + cluster * 120}, 80)`}>
                        <circle cx="0" cy="0" r="30" fill="white" stroke={colors.stroke} strokeWidth="1" />
                        <circle cx="-35" cy="0" r="10" fill={colors.accent} stroke={colors.stroke} strokeWidth="0.5" />
                        <circle cx="35" cy="0" r="10" fill={colors.accent} stroke={colors.stroke} strokeWidth="0.5" />
                        <circle cx="0" cy="-35" r="10" fill={colors.accent} stroke={colors.stroke} strokeWidth="0.5" />
                        <circle cx="0" cy="35" r="10" fill={colors.accent} stroke={colors.stroke} strokeWidth="0.5" />
                     </g>
                   ))}
                </g>
              )}
              
              {/* Decorative Details */}
              <circle cx="370" cy="30" r="8" fill="#dcfce7" /> {/* Plant */}
              <line x1="365" y1="25" x2="375" y2="35" stroke="#059669" strokeWidth="1" />
              <line x1="375" y1="25" x2="365" y2="35" stroke="#059669" strokeWidth="1" />
              
            </svg>
          ) : (
            <div className="flex flex-col items-center gap-4 py-12">
               <div className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: colors.accent }}>
                  <Zap className="w-12 h-12" style={{ color: colors.stroke }} />
               </div>
               <p className="text-sm font-black uppercase tracking-widest text-[#182c51]">Portable Asset</p>
            </div>
          )}
        </div>

        {/* Legend / Key */}
        <div className="px-8 pb-8 flex flex-wrap gap-4 border-t border-dashed justify-center pt-6"
             style={{ borderColor: colors.accent }}>
           <LegendItem icon={DoorOpen} label="Exits" color={colors.stroke} />
           <LegendItem icon={Coffee} label="Break Zone" color={colors.stroke} />
           <LegendItem icon={Zap} label="Power Hub" color={colors.stroke} />
           {equipment.slice(0, 3).map(eq => (
             <LegendItem key={eq} icon={getIcon(eq)} label={eq} color={colors.stroke} />
           ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LegendItem({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
      <Icon className="w-3 h-3" style={{ color }} />
      <span className="text-[10px] font-bold text-slate-500">{label}</span>
    </div>
  );
}
