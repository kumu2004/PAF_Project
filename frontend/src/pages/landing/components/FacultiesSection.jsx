import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FACULTIES } from '../data/faculties';

const FacultyGalleryCard = ({ faculty, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden 
                 cursor-pointer border border-slate-200 shadow-xl"
    >
      {/* Background Image with Zoom Effect */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700
                   group-hover:scale-110"
        style={{ backgroundImage: `url(${faculty.image})` }}
      >
        {/* Blue Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#1E40AF]/40 to-transparent opacity-90" />
      </motion.div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-8">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-black px-3 py-1 rounded-full tracking-widest
                           bg-[#2563EB] text-white uppercase shadow-lg shadow-blue-500/20">
            {faculty.code}
          </span>
          <span className="text-2xl drop-shadow-lg">{faculty.emoji}</span>
        </div>
        
        <h3 className="text-xl font-black text-white mb-2 transition-colors leading-tight">
          {faculty.name}
        </h3>
        
        <div className="h-[2px] w-0 group-hover:w-full bg-[#38BDF8] transition-all duration-500 rounded-full" />
      </div>

      {/* Floating Action */}
      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <div className="px-4 py-2 rounded-xl bg-[#2563EB] text-[10px] text-white font-black uppercase tracking-widest shadow-xl">
          View Detail
        </div>
      </div>
    </motion.div>
  );
};

export function FacultiesSection() {
  const navigate = useNavigate();

  return (
    <section id="faculties" className="py-32 relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-black tracking-[0.4em] uppercase px-6 py-2.5
                       rounded-2xl border mb-8 inline-block shadow-sm"
            style={{ color: '#2563EB', borderColor: 'rgba(37, 99, 235, 0.2)', background: 'rgba(37, 99, 235, 0.03)' }}
          >
            Institutional Reach
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black text-[#0F172A] leading-tight flex flex-col gap-2"
          >
            <span>Managed Across</span>
            <span style={{ color: '#38BDF8' }}>Every Department</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {FACULTIES.map((faculty, idx) => (
            <FacultyGalleryCard 
              key={faculty.code} 
              faculty={faculty}
              index={idx}
              onClick={() => navigate('/register')}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: FACULTIES.length * 0.1 }}
            className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden 
                       border-4 border-dashed border-slate-100 flex flex-col items-center justify-center
                       bg-[#F8FAFC] hover:border-blue-100 transition-all duration-300"
          >
            <div className="text-center p-8">
              <p className="text-lg font-black text-slate-300 uppercase tracking-tighter leading-tight italic">
                Expanding to all<br />SLIIT Campuses
              </p>
            </div>
          </motion.div>
        </div>

        <div className="text-center mt-24">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="px-16 py-5 rounded-2xl font-black text-sm tracking-widest uppercase
                       transition-all shadow-2xl bg-[#2563EB] text-white"
          >
            Register Your Faculty
          </motion.button>
        </div>
      </div>
    </section>
  );
}
