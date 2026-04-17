const STATS = [
  { number: '500+',  label: 'Campus resources'   },
  { number: '7',     label: 'Faculties supported' },
  { number: '10k+',  label: 'Students enrolled'  },
  { number: '24/7',  label: 'Live support'      },
];

export function StatsBar() {
  return (
    <section
      className="relative z-10 py-16"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(15, 23, 42, 0.05)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center group"
            >
              <div className="text-5xl font-black mb-3 transition-transform group-hover:scale-110"
                   style={{ color: '#0F172A' }}>
                {stat.number}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em]"
                   style={{ color: '#38BDF8' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
