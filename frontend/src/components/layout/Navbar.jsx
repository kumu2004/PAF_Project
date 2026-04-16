import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Ticket, Bell, Settings, MessageSquare, Plus, LayoutDashboard, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import ThemeToggle from '../ThemeToggle';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Tickets', icon: Ticket, path: '/tickets' },
    { name: 'Resources', icon: Settings, path: '/resources' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-3 group px-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-6 transition-transform overflow-hidden">
            <img src="/logo.png" alt="SmartCampus" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-foreground leading-none">SmartCampus</span>
            <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-0.5">Operation Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-4">
          <div className="hidden md:flex items-center gap-2 mr-6 bg-muted/50 p-1 rounded-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    isActive 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
             <ThemeToggle />
             <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
             </Button>
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 border-2 border-white shadow-md flex items-center justify-center cursor-pointer overflow-hidden hover:scale-105 transition-transform">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User avatar" />
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
