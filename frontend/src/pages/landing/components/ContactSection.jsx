import { useState }            from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

export function ContactSection() {
  const [form, setForm]   = useState({ name: '', email: '', message: '' });
  const [sent, setSent]   = useState(false);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          <div>
            <span className="text-xs font-bold tracking-widest uppercase px-3 py-1
                             rounded-full border mb-6 inline-block"
                  style={{ color: '#f47920', borderColor: '#f47920',
                           background: 'rgba(244,121,32,0.07)' }}>
              Contact us
            </span>
            <h2 className="text-4xl font-extrabold mt-3 mb-6"
                style={{ color: '#182c51' }}>
              We are here to help
            </h2>
            <p className="text-slate-500 leading-relaxed mb-10">
              Have a question about Smart Campus? Need help with your account?
              Reach out and we will get back to you as soon as possible.
            </p>

            <div className="space-y-5">
              {[
                { icon: Mail,    text: 'support@smartcampus.com'        },
                { icon: Phone,   text: '+94 11 754 4801'                },
                { icon: MapPin,  text: 'New Kandy Rd, Malabe, Sri Lanka' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center
                                  justify-center flex-shrink-0"
                       style={{ background: 'rgba(0,33,71,0.07)' }}>
                    <Icon className="w-5 h-5" style={{ color: '#182c51' }} />
                  </div>
                  <span className="text-sm text-slate-600">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-8 border"
               style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                     style={{ background: 'rgba(244,121,32,0.15)' }}>
                  <span style={{ fontSize: 24 }}>✓</span>
                </div>
                <h3 className="font-bold text-lg mb-2"
                    style={{ color: '#182c51' }}>
                  Message sent!
                </h3>
                <p className="text-sm text-slate-500">
                  We will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold mb-1.5"
                         style={{ color: '#182c51' }}>
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Your full name"
                    className="w-full text-sm px-4 py-3 rounded-xl border
                               bg-white outline-none transition-all
                               focus:ring-2 focus:ring-[#f47920]/30"
                    style={{ borderColor: '#e2e8f0' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5"
                         style={{ color: '#182c51' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full text-sm px-4 py-3 rounded-xl border
                               bg-white outline-none transition-all
                               focus:ring-2 focus:ring-[#f47920]/30"
                    style={{ borderColor: '#e2e8f0' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5"
                         style={{ color: '#182c51' }}>
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full text-sm px-4 py-3 rounded-xl border
                               bg-white outline-none transition-all resize-none
                               focus:ring-2 focus:ring-[#f47920]/30"
                    style={{ borderColor: '#e2e8f0' }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm
                             transition-all hover:opacity-90 active:scale-95"
                  style={{ background: '#182c51', color: '#f47920' }}
                >
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
