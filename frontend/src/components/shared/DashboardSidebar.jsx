import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore }             from '../../store/authStore';
import { 
  X, LogOut, Settings, LayoutDashboard, 
  Building2, CalendarDays, Ticket, Users, 
  Bell, UserCheck, Wrench, PanelLeftClose, 
  PanelLeftOpen, BarChart2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_BY_ROLE = {
  ADMIN: [
    { label: 'Dashboard',        path: '/admin/dashboard',     icon: LayoutDashboard },
    { label: 'Resources',        path: '/admin/resources',     icon: Building2       },
    { label: 'Analytics',        path: '/admin/analytics',     icon: BarChart2       },
    { label: 'Bookings',         path: '/admin/bookings',      icon: CalendarDays    },
    { label: 'Tickets',          path: '/admin/tickets',       icon: Ticket          },
    { label: 'Registrations',    path: '/admin/registrations', icon: UserCheck       },
    { label: 'Users',            path: '/admin/users',         icon: Users           },
    { label: 'Notifications',    path: '/admin/notifications', icon: Bell            },
  ],
  STUDENT: [
    { label: 'Dashboard',        path: '/student/dashboard',   icon: LayoutDashboard },
    { label: 'Browse resources', path: '/student/resources',   icon: Building2       },
    { label: 'My bookings',      path: '/bookings/my',         icon: CalendarDays    },
    { label: 'My tickets',       path: '/tickets/my',          icon: Ticket          },
    { label: 'Notifications',    path: '/notifications',       icon: Bell            },
  ],
  LECTURER: [
    { label: 'Dashboard',        path: '/lecturer/dashboard',  icon: LayoutDashboard },
    { label: 'Browse resources', path: '/lecturer/resources',  icon: Building2       },
    { label: 'My bookings',      path: '/bookings/my',         icon: CalendarDays    },
    { label: 'My tickets',       path: '/tickets/my',          icon: Ticket          },
    { label: 'Notifications',    path: '/notifications',       icon: Bell            },
  ],
  TECHNICIAN: [
    { label: 'Dashboard',        path: '/technician/dashboard',icon: LayoutDashboard },
    { label: 'Assigned tickets', path: '/tickets/assigned',     icon: Wrench          },
    { label: 'All resources',    path: '/technician/resources', icon: Building2       },
    { label: 'Notifications',    path: '/notifications',       icon: Bell            },
  ],
};

export function DashboardSidebar({ open, onClose, isCollapsed, onToggleCollapse }) {
  const { user, logout } = useAuthStore();
  const navigate          = useNavigate();
  const navItems          = NAV_BY_ROLE[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const sidebarVariants = {
    expanded:  { width: '256px' }, 
    collapsed: { width: '80px' },
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col
          md:static md:translate-x-0 md:z-auto md:flex
          ${open ? 'translate-x-0' : '-translate-x-full'}
          transition-[transform] duration-300 ease-in-out
        `}
        style={{ background: '#182c51' }}
      >
        {/* Header section */}
        <div className="flex items-center justify-between p-5 border-b flex-shrink-0 relative"
             style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'}`}
                 style={{ background: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>
              <img src="/logo.png" alt="Smart Campus" className="w-full h-full object-cover" />
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">
                    Smart Campus
                  </p>
                  <p className="text-[10px] leading-tight font-black uppercase tracking-tighter"
                     style={{ color: '#f47920' }}>
                    {user?.role}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            className="md:hidden text-slate-400 hover:text-white p-1"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User profile section */}
        <div className="px-4 py-4 border-b flex-shrink-0"
             style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center
                            text-xs font-bold flex-shrink-0"
                 style={{ background: 'rgba(244,121,32,0.2)',
                           color: '#f47920' }}>
              {user?.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'SC'}
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0"
                >
                  <p className="text-white text-sm font-medium truncate">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-[10px] truncate"
                     style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {user?.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center rounded-xl text-sm font-medium transition-all duration-200
                   ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5 gap-3'}
                   ${isActive
                     ? 'text-[#182c51] font-semibold'
                     : 'text-slate-400 hover:text-white hover:bg-white/5'}`
                }
                style={({ isActive }) =>
                  isActive
                    ? { background: '#f47920', color: '#182c51' }
                    : {}
                }
              >
                <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer section */}
        <div className="px-3 py-4 border-t flex-shrink-0 space-y-1"
             style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          
          <button
            onClick={onToggleCollapse}
            className={`w-full flex items-center rounded-xl text-sm font-medium 
                       text-slate-400 hover:text-[#f47920] hover:bg-white/5 transition-all
                       ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5 gap-3'}`}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-4 h-4" />}
            {!isCollapsed && <span>Collapse sidebar</span>}
          </button>

          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center rounded-xl text-sm font-medium transition-all
               ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5 gap-3'}
               ${isActive
                 ? 'text-[#f47920]'
                 : 'text-slate-400 hover:text-white hover:bg-white/5'}`
            }
          >
            <Settings className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
            {!isCollapsed && <span>Profile & settings</span>}
          </NavLink>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-xl text-sm font-medium 
                       text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all
                       ${isCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5 gap-3'}`}
          >
            <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}


