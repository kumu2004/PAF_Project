import { useState }    from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS }        from '../data/faqs';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <span className="text-xs font-bold tracking-widest uppercase px-3 py-1
                           rounded-full border mb-4 inline-block"
                style={{ color: '#f47920', borderColor: '#f47920',
                         background: 'rgba(244,121,32,0.07)' }}>
            FAQ
          </span>
          <h2 className="text-4xl font-extrabold mt-3"
              style={{ color: '#182c51' }}>
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border bg-white overflow-hidden"
              style={{ borderColor: openIndex === i ? '#f47920' : '#e2e8f0' }}
            >
              <button
                className="w-full flex items-center justify-between
                           px-6 py-5 text-left gap-4 transition-colors
                           hover:bg-slate-50/50"
                onClick={() => toggle(i)}
              >
                <span className="font-semibold text-sm"
                      style={{ color: '#182c51' }}>
                  {faq.q}
                </span>
                <ChevronDown
                  className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                  style={{
                    color: '#f47920',
                    transform: openIndex === i ? 'rotate(180deg)' : 'none',
                  }}
                />
              </button>

              {openIndex === i && (
                <div className="px-6 pb-5 border-t"
                     style={{ borderColor: 'rgba(244,121,32,0.15)' }}>
                  <p className="text-sm text-slate-600 leading-relaxed pt-4">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
