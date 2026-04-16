import { Menu, LogOut, User }  from 'lucide-react';
import { useNavigate }               from 'react-router-dom';
import { useAuthStore }                  from '../../store/authStore';
import { NotificationBell }          from '../../features/notifications/components/NotificationBell';
import { Button }                    from '../ui/button';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback }    from '../ui/avatar';

const ROLE_COLOURS = {
  ADMIN:      { bg: 'bg-red-100',    text: 'text-red-700'    },
  STUDENT:    { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  LECTURER:   { bg: 'bg-purple-100', text: 'text-purple-700' },
  TECHNICIAN: { bg: 'bg-amber-100',  text: 'text-amber-700'  },
};

export function DashboardHeader({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const navigate         = useNavigate();

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SC';

  const roleStyle = ROLE_COLOURS[user?.role] || {};

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header
      className="h-16 flex items-center justify-between
                 px-4 sm:px-6 border-b bg-white z-10 flex-shrink-0"
      style={{ borderColor: '#f1f5f9' }}
    >
      {/* Left — mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Role badge */}
        <span className={`hidden sm:inline-flex items-center px-2.5 py-1
                          rounded-full text-[10px] font-black uppercase tracking-widest
                          ${roleStyle.bg} ${roleStyle.text}`}>
          {user?.role}
        </span>
      </div>

      {/* Right — notifications + profile */}
      <div className="flex items-center gap-2">

        {/* Notification bell */}
        <NotificationBell />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 px-2 h-10 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#f47920] border-none bg-transparent"
          >
            <Avatar className="h-8 w-8 pointer-events-none">
              <AvatarFallback
                className="text-xs font-bold text-white"
                style={{ background: '#182c51' }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left pointer-events-none">
              <p className="text-xs font-bold text-[#182c51] leading-none mb-1">
                {user?.fullName}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {user?.email}
              </p>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52 bg-white rounded-2xl shadow-xl border-slate-100 p-2">
            <DropdownMenuItem 
              onClick={() => navigate('/profile')}
              className="rounded-xl focus:bg-slate-50 cursor-pointer py-2.5"
            >
              <User className="mr-2 h-4 w-4 text-[#182c51]" />
              <span className="text-sm font-medium">My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-slate-50" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive rounded-xl cursor-pointer py-2.5 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-sm font-bold text-red-500">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
