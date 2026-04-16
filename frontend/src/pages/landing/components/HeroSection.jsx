import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useRef } from 'react';
import { motion } from 'framer-motion';

const TRUST_ITEMS = [
  'Free for all students and staff',
  'All 7 faculties supported',
  'Real-time notifications',
];

export function HeroSection() {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const scrollToFeatures = () =>
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
    >
      {/* Static Background Pattern - Sky Blue Theme */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='none' stroke='%2338BDF8' stroke-width='1' stroke-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl">

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                          text-xs font-black uppercase tracking-[0.2em] mb-8 border backdrop-blur-sm"
               style={{
                 background: 'rgba(56, 189, 248, 0.1)',
                 borderColor: 'rgba(56, 189, 248, 0.3)',
                 color: '#38BDF8',
               }}>
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-ping" />
            System Central Hub — 2026
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="text-6xl sm:text-7xl font-black text-white
                          leading-none tracking-tighter mb-8 italic">
            Optimize your <br />
            <span style={{ color: '#38BDF8' }}>
              Campus Life
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-300 leading-relaxed mb-12 max-w-xl font-medium">
            A powerful, all-in-one management system designed to streamline 
            academic workflows, resource booking, and campus communications.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-5 mb-16">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl
                         font-black text-sm uppercase tracking-widest transition-all
                         hover:shadow-2xl hover:shadow-primary/30 active:scale-95 shadow-xl"
               style={{ backgroundColor: '#2563EB', color: '#fff' }}
            >
              Get started now
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={scrollToFeatures}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl
                         text-sm font-black uppercase tracking-widest text-white
                         transition-all hover:bg-white/10 border-2 border-white/20"
            >
              Learn More
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-8">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#38BDF8]/10 border border-[#38BDF8]/20">
                    <CheckCircle className="w-4 h-4" style={{ color: '#38BDF8' }} />
                 </div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
