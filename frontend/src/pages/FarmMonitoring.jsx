import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const features = [
  { icon: '📡', title: '24/7 Live View',       desc: 'Watch HD footage from your phone anytime.' },
  { icon: '🔔', title: 'Motion Alerts',         desc: 'Instant WhatsApp alert when motion is detected.' },
  { icon: '☁️', title: 'Cloud Recording',       desc: '30 days of stored footage, accessible anytime.' },
  { icon: '🛡️', title: 'Physical Patrol',       desc: 'Our team walks your farm perimeter every month.' },
]

export default function FarmMonitoring() {
  return (
    <Layout>

      {/* Header */}
      <section className="bg-gf-dark text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-gf-pale text-gf-dark text-xs font-heading font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-wide">
            Live Camera Monitoring
          </span>
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">
            Watch Your Farm Live
          </h1>
          <p className="text-white/70 text-lg mb-8">
            HD cameras on your farm. Live view on your phone. Motion alerts on WhatsApp.
          </p>
          <Link to="/contact" className="btn-outline inline-block">
            Get Cameras Installed
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 bg-gf-offwhite">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-bold text-gf-dark text-2xl text-center mb-10">How It Works</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-0 md:gap-0">
            {[
              { num: '01', title: 'We install cameras',   sub: 'HD cameras at gate, crop areas & boundaries.' },
              { num: '02', title: 'Live access on phone', sub: 'Watch your farm from anywhere within 24 hours.' },
              { num: '03', title: 'Patrol & alerts',      sub: 'Field rounds + WhatsApp alerts on motion.' },
            ].map((s, i) => (
              <div key={s.num} className="flex md:flex-col items-center md:items-center gap-4 md:gap-0 flex-1">
                <div className="flex md:flex-col items-center gap-2 md:gap-2 w-full">
                  <div className="w-12 h-12 rounded-full bg-gf-dark text-white flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                    {s.num}
                  </div>
                  {i < 2 && <div className="hidden md:block h-0.5 bg-gf-pale flex-1 w-full mt-0" style={{marginTop:'-24px', zIndex:0}} />}
                </div>
                <div className="md:text-center md:mt-4 flex-1">
                  <p className="font-heading font-semibold text-gf-dark text-sm mb-1">{s.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-bold text-gf-dark text-2xl text-center mb-8">What You Get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(f => (
              <div key={f.title} className="flex items-start gap-4 bg-gf-offwhite rounded-xl border border-gf-pale px-5 py-4 hover:border-gf-light transition-colors">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-heading font-semibold text-gf-dark text-sm mb-0.5">{f.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gf-dark py-14">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-white text-2xl mb-3">
            Ready to watch your farm live?
          </h2>
          <p className="text-white/60 text-sm mb-7">
            We install cameras and have your farm monitored within a week of the site visit.
          </p>
          <Link to="/contact" className="btn-outline inline-block">
            Get Cameras Installed
          </Link>
        </div>
      </section>

    </Layout>
  )
}
