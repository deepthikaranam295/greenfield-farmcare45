import Layout from '../components/Layout'
import { Link } from 'react-router-dom'

const values = [
  { icon: '🤝', title: 'One Dedicated Team',       desc: 'Single point of contact — no juggling vendors.' },
  { icon: '👁️', title: 'Full Visibility',           desc: 'Cameras, WhatsApp updates and monthly reports.' },
  { icon: '📍', title: 'Local Expertise',           desc: 'We know the land, climate and local vendors.' },
  { icon: '📋', title: 'Honest Quotes',             desc: 'Itemised quotes before any work begins.' },
]

export default function About() {
  return (
    <Layout>

      {/* Header */}
      <section className="bg-gf-dark text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">
            About GreenField Farm Care
          </h1>
          <p className="text-white/70 text-lg">
            A dedicated farm management team for city-based owners who want their land
            productive and protected — without being there.
          </p>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-16 bg-gf-offwhite">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-xs font-heading font-semibold text-gf-light uppercase tracking-widest">Who We Are</span>
              <h2 className="font-heading font-bold text-gf-dark text-2xl md:text-3xl mt-2 mb-4">
                Your Farm's Trusted Local Team
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                GreenField Farm Care was built for one reason — farm owners who live in cities
                shouldn't have to worry about their land. We handle fencing, irrigation, plantation,
                camera monitoring and ongoing maintenance, and send photo updates to your WhatsApp
                every month.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '13+', label: 'Services Offered' },
                { num: '100%', label: 'Transparent Reporting' },
                { num: '48h', label: 'Quote Turnaround' },
                { num: '1', label: 'Point of Contact' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gf-pale p-5 text-center">
                  <p className="font-heading font-extrabold text-gf-dark text-3xl mb-1">{s.num}</p>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-bold text-gf-dark text-2xl text-center mb-8">What Makes Us Different</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map(v => (
              <div key={v.title} className="flex items-start gap-4 bg-gf-offwhite rounded-xl border border-gf-pale px-5 py-4">
                <span className="text-2xl">{v.icon}</span>
                <div>
                  <p className="font-heading font-semibold text-gf-dark text-sm mb-0.5">{v.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where we operate */}
      <section className="py-12 bg-gf-dark text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-bold text-2xl mb-3">Where We Operate</h2>
          <p className="text-white/60 mb-6 text-sm">Currently serving farms across South India. Expanding soon.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gf-mid text-white border border-gf-light">South India — Active</span>
            <span className="px-4 py-2 rounded-full text-sm bg-white/10 text-white/50 border border-white/15">West India — Soon</span>
            <span className="px-4 py-2 rounded-full text-sm bg-white/10 text-white/50 border border-white/15">North India — Soon</span>
            <span className="px-4 py-2 rounded-full text-sm bg-white/10 text-white/50 border border-white/15">East India — Soon</span>
          </div>
          <div className="mt-8">
            <Link to="/contact" className="btn-outline inline-block">Get in Touch</Link>
          </div>
        </div>
      </section>

    </Layout>
  )
}
