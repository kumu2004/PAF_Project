import { motion } from 'framer-motion';
import { 
  Building2, 
  ShieldAlert, 
  CalendarCheck, 
  Users2, 
  FileText, 
  Zap 
} from 'lucide-react';

const FEATURES = [
  {
    icon: Building2,
    number: '01',
    title: 'Facility Booking',
    desc: 'Reserve lecture halls, labs, and collaborative spaces in seconds with real-time availability.',
    highlight: 'Instant Confirmation'
  },
  {
    icon: ShieldAlert,
    number: '02',
    title: 'Incident Reporting',
    desc: 'Report equipment failures or facility issues directly to the technical team with status tracking.',
    highlight: 'Quick Resolution'
  },
  {
    icon: CalendarCheck,
    number: '03',
    title: 'Resource Scheduling',
    desc: 'Manage academic and campus-wide events with an integrated, intuitive calendar system.',
    highlight: 'Unified Timelines'
  },
  {
    icon: Users2,
    number: '04',
    title: 'Collaborative Hub',
    desc: 'Connect students, faculty, and technical staff through a centralized communication bridge.',
    highlight: 'Team Sync'
  },
  {
    icon: FileText,
    number: '05',
    title: 'Asset Management',
    desc: 'Keep track of campus inventory and equipment lifecycle efficiently within the platform.',
    highlight: 'Inventory Tracking'
  },
  {
    icon: Zap,
    number: '06',
    title: 'Smart Analytics',
    desc: 'Gain insights into facility usage and operational performance with data-driven reports.',
    highlight: 'Data Insights'
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-black tracking-[0.3em] uppercase px-5 py-2
                       rounded-xl border mb-6 inline-block shadow-sm"
            style={{ color: '#2563EB', borderColor: 'rgba(37, 99, 235, 0.2)',
                     background: 'rgba(255, 255, 255, 0.8)' }}
          >
            System Modules
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-[#0F172A] leading-tight"
          >
            Streamlined solutions
            <br />
            <span style={{ color: '#2563EB' }}>built for efficiency</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: '0 30px 60px -15px rgba(37, 99, 235, 0.15)'
                }}
                className="group relative rounded-3xl p-10 bg-white border border-slate-100 transition-all duration-300"
              >
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8
                                  bg-slate-50 border border-slate-100 group-hover:bg-[#2563EB] group-hover:border-[#2563EB] transition-all duration-300"
                       >
                    <Icon className="w-7 h-7 text-[#2563EB] group-hover:text-white transition-colors" />
                  </div>

                  <span className="text-[10px] font-black tracking-widest text-[#38BDF8] 
                                  uppercase mb-4 block">
                    Module {feat.number}
                  </span>

                  <h3 className="text-xl font-black text-[#0F172A] mb-4 group-hover:text-[#2563EB] transition-colors">
                    {feat.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    {feat.desc}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-6 bg-[#2563EB]/20 group-hover:bg-[#2563EB] group-hover:w-10 transition-all" />
                    <span className="text-xs font-black text-[#2563EB] uppercase tracking-wider">
                      {feat.highlight}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
