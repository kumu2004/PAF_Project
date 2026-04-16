const LINKS = [
  { label: 'Features',    href: '#features'     },
  { label: 'How it works',href: '#how-it-works' },
  { label: 'Faculties',   href: '#faculties'    },
  { label: 'About',       href: '#about'        },
  { label: 'FAQ',         href: '#faq'          },
  { label: 'Contact',     href: '#contact'      },
];

const scrollTo = (href) =>
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

export function LandingFooter() {
  return (
    <footer style={{ background: '#0F172A' }}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">

          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center
                            font-extrabold text-sm shadow-xl"
                 style={{ background: '#fff' }}>
              <img src="/logo1.png" alt="Smart Campus" className="w-full h-full object-cover" />
            </div>
              <div>
                <span className="text-white font-black text-lg tracking-tight">Campus Central</span>
                <span className="block text-[10px] uppercase font-black tracking-widest leading-none mt-1" style={{ color: '#38BDF8' }}>
                  Management System
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs font-medium">
              Enterprise-grade campus operational hub providing unified management for assets, facilities, and academic workflows.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                style={{ color: '#38BDF8' }}>
              Explore System
            </h4>
            <div className="grid grid-cols-2 gap-y-4">
              {LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="block text-sm text-slate-500 font-bold
                             hover:text-[#38BDF8] transition-colors text-left uppercase tracking-tighter"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                style={{ color: '#38BDF8' }}>
              Access Portal
            </h4>
            <div className="space-y-4">
              <a href="/register"
                 className="block text-xs py-4 px-6 rounded-xl text-center shadow-xl shadow-blue-500/10
                            font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95"
                 style={{ background: '#2563EB', color: '#fff' }}>
                Secure Registration
              </a>
              <a href="/login"
                 className="block text-xs py-4 px-6 rounded-xl text-center
                            border-2 border-slate-800 transition-all hover:bg-slate-800
                            font-black uppercase tracking-[0.2em]"
                 style={{ color: '#38BDF8' }}>
                Existing User Login
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t px-4 sm:px-6 lg:px-8 py-8"
           style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:row
                        items-center justify-between gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
            © {new Date().getFullYear()} Campus Management System. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8]">Privacy Protocol</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8]">System Status: Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
