import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Faculties', href: '#faculties' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export function LandingNavbar({ mode = 'landing' }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const isAdminAuth = mode === 'adminAuth';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200
                  ${scrolled
          ? 'border-b border-primary/20 shadow-lg shadow-black/10 backdrop-blur-md'
          : ''}`}
      style={{ backgroundColor: scrolled ? 'rgba(30, 64, 175, 0.95)' : 'rgba(30, 64, 175, 0.85)' }} // Using Secondary #1E40AF with opacity
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={() => {
              if (window.location.pathname !== '/') {
                navigate('/');
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}>
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center
                            font-extrabold text-sm shadow-inner"
              style={{ backgroundColor: '#fff' }}>
              <img src="/logo1.png" alt="Smart Campus" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">
                Campus Management System
              </span>
              <span className="block text-[10px] uppercase font-black tracking-widest leading-none mt-1"
                style={{ color: '#38BDF8' }}> {/* Accent Sky Blue */}
                Campus Operations
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {!isAdminAuth &&
              NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-sm font-medium text-slate-200 hover:text-white
                             transition-colors duration-150 uppercase tracking-wide"
                >
                  {link.label}
                </button>
              ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAdminAuth ? (
              <button
                onClick={() => navigate('/')}
                className="text-xs px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest
                           transition-all hover:shadow-lg active:scale-95 shadow-[#2563EB]/20"
                style={{ backgroundColor: '#2563EB', color: '#fff' }}
              >
                Back to CMS
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-xs px-5 py-2.5 rounded-xl transition-all font-bold uppercase tracking-widest
                             border border-white/20 text-white hover:bg-white/10"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="text-xs px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest
                             transition-all hover:shadow-lg active:scale-95 shadow-[#2563EB]/40 shadow-xl"
                  style={{ backgroundColor: '#2563EB', color: '#fff' }}
                >
                  Get started
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen
              ? <X className="w-6 h-6" />
              : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-300"
          style={{
            backgroundColor: '#1E40AF', // Secondary
          }}>
          {!isAdminAuth &&
            NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left text-base font-bold text-slate-100
                           hover:text-white py-2 transition-colors uppercase tracking-widest"
              >
                {link.label}
              </button>
            ))}
          <div className="pt-4 flex flex-col gap-3 border-t border-white/10">
            {isAdminAuth ? (
              <button
                onClick={() => navigate('/')}
                className="w-full text-sm py-3.5 rounded-xl font-bold uppercase tracking-widest"
                style={{ backgroundColor: '#2563EB', color: '#fff' }}
              >
                Back to CMS
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-sm py-3.5 rounded-xl border border-white/30 text-white
                             font-bold uppercase tracking-widest"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="w-full text-sm py-3.5 rounded-xl font-bold uppercase tracking-widest"
                  style={{ backgroundColor: '#2563EB', color: '#fff' }}
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
