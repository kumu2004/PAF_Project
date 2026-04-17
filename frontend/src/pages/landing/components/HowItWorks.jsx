import { UserPlus, Search, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    icon:        UserPlus,
    step:        '01',
    title:       'Create your account',
    description: 'Register with your student details. Students are active immediately — choose your faculty, academic year, and semester.',
  },
  {
    icon:        Search,
    step:        '02',
    title:       'Browse and request',
    description: 'Find available facilities and equipment across the campus. Submit a booking or report a fault in under a minute.',
  },
  {
    icon:        CheckCircle,
    step:        '03',
    title:       'Track and get notified',
    description: 'Receive real-time notifications on every update. Your booking confirmation, ticket status changes — all in one place.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase px-3 py-1
                           rounded-full border mb-4 inline-block"
                style={{ color: '#f47920', borderColor: '#f47920',
                         background: 'rgba(244,121,32,0.07)' }}>
            Simple process
          </span>
          <h2 className="text-4xl font-extrabold mt-3"
              style={{ color: '#182c51' }}>
            Up and running in minutes
          </h2>
          <p className="text-slate-500 mt-4 max-w-lg mx-auto">
            No training needed. If you can use a website, you can use Smart Campus.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="hidden md:block absolute top-10 left-1/6 right-1/6
                          h-0.5 opacity-20"
               style={{ background: '#f47920' }} />

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative text-center group">

                <div className="w-20 h-20 rounded-full mx-auto mb-6
                                flex items-center justify-center relative
                                border-2 transition-all group-hover:scale-105"
                     style={{
                       borderColor: '#f47920',
                       background: 'rgba(244,121,32,0.07)',
                     }}>
                  <Icon className="w-8 h-8" style={{ color: '#182c51' }} />

                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full
                                   flex items-center justify-center text-xs font-bold"
                        style={{ background: '#f47920', color: '#182c51' }}>
                    {step.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-3"
                    style={{ color: '#182c51' }}>
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <a href="/register"
             className="inline-flex items-center gap-2 px-8 py-4 rounded-xl
                        font-bold text-base transition-all hover:opacity-90"
             style={{ background: '#182c51', color: '#f47920' }}>
            Start now — it's free
          </a>
        </div>
      </div>
    </section>
  );
}
