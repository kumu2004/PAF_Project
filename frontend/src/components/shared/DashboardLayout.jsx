import { useState, useEffect } from 'react';
import { Outlet }           from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader }  from './DashboardHeader';
import { Toaster }          from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * The shell that wraps every authenticated dashboard.
 */
export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Persistent collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        isCollapsed={isCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <Toaster richColors position="top-right" />
    </div>
  );
}

