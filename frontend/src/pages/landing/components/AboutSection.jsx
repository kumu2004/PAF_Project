import { motion } from 'framer-motion';
import { Target, Users, Shield, Rocket } from 'lucide-react';

const PILLARS = [
  { icon: Target, label: 'Efficiency', desc: 'Optimize resource allocation and booking workflows.' },
  { icon: Users, label: 'Experience', desc: 'Unified interface for students, lecturers, and staff.' },
  { icon: Shield, label: 'Security', desc: 'Role-based access control and secure data handling.' },
  { icon: Rocket, label: 'Innovation', desc: 'Modern tech stack for a futuristic campus operations.' },
];

export function AboutSection() {
  return (
    <section id="about" className="py-32 bg-[#F8FAFC] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs font-black tracking-widest uppercase px-4 py-2
                             rounded-xl border mb-8 inline-block shadow-sm"
                  style={{ color: '#2563EB', borderColor: 'rgba(37, 99, 235, 0.2)',
                           background: 'white' }}>
              About Current System
            </span>

            <h2 className="text-5xl font-black mb-8 leading-tight tracking-tighter"
                style={{ color: '#0F172A' }}>
              Management system,<br />
              <span style={{ color: '#2563EB' }}>finally done right</span>
            </h2>

            <p className="text-slate-600 leading-relaxed mb-10 text-lg">
              Smart Campus Operation Hub is more than just a booking tool. 
              It is a mission-critical infrastructure that empowers the 
              educational environment by bridging the gap between physical 
              resources and digital management.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {PILLARS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div 
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4 group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center 
                                    bg-white border border-slate-100 shadow-sm group-hover:bg-[#2563EB] group-hover:border-[#2563EB] transition-all">
                      <Icon className="w-5 h-5 text-[#2563EB] group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-[#0F172A] mb-1 uppercase tracking-wider text-xs">{item.label}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right — visual block */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-[3rem] p-12 text-center shadow-2xl relative z-10"
                 style={{ background: '#1E40AF' }}>
              <div className="text-5xl font-black mb-6 italic tracking-tighter"
                   style={{ color: '#38BDF8' }}>
                System Core
              </div>
              <p className="text-slate-200 text-sm mb-12 font-medium leading-relaxed">
                Centralizing all campus operations into a single, high-performance 
                operational hub. Security, reliability, and speed are at the 
                heart of our architecture.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Uptime', val: '99.9%' },
                  { label: 'Security', val: 'AES-256' },
                ].map(item => (
                  <div key={item.label} 
                       className="rounded-2xl p-6 backdrop-blur-md transition-transform hover:scale-105"
                       style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2"
                       style={{ color: '#38BDF8' }}>
                      {item.label}
                    </p>
                    <p className="text-xl text-white font-black">
                      {item.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#38BDF8]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#2563EB]/20 rounded-full blur-3xl" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
