import { Link } from 'react-router-dom'
import { ArrowRight, Check, MapPin } from 'lucide-react'
import Layout from '../components/Layout'
import FadeIn from '../components/ui/FadeIn'
import SectionHeading from '../components/ui/SectionHeading'

const trustCards = [
  { icon: '🤝', title: 'Local Expertise', desc: 'Born and raised in Anantapur — we understand the soil, climate, water table and local vendor ecosystem better than anyone.' },
  { icon: '📋', title: 'Written Agreements', desc: 'Every service comes with a written agreement detailing scope, timeline, price and warranty. No verbal commitments.' },
  { icon: '📸', title: 'Photo Documentation', desc: 'Before and after photos for every task. Monthly photographic reports so you can see the progress with your own eyes.' },
  { icon: '⚡', title: 'Fast Response', desc: 'WhatsApp response within 2 hours during business hours. On-site response to emergencies within 30 minutes.' },
]

const serviceAreas = [
  'Anantapur Town', 'Tadipatri', 'Gorantla', 'Hindupur', 'Kadiri',
  'Dharmavaram', 'Guntakal', 'Rayadurg', 'Uravakonda', 'Kanekal',
]

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero text-white py-24 md:py-32">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="section-label text-gf-pale">About Us</span>
            <h1 className="section-heading text-white text-4xl md:text-5xl mt-2 mb-5 text-balance max-w-4xl mx-auto">
              We Make Farm Ownership Simple, Secure and Stress-Free
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto font-body">
              GreenField Farm Care was started to solve one problem: NRIs and working professionals who
              own farmland in Anantapur have no reliable local partner to manage it.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Story */}
      <section className="section-pad bg-gf-offwhite">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeIn>
              <span className="section-label">Our Story</span>
              <h2 className="section-heading text-3xl md:text-4xl mt-2 mb-6">
                Started From a Real Problem
              </h2>
              <div className="space-y-4 text-gf-muted leading-relaxed font-body">
                <p>
                  Our founder's family owns 8 acres of farmland in Tadipatri mandal. After relocating
                  to Hyderabad for work, managing the land remotely became a constant source of stress —
                  unreliable caretakers, no transparency, encroachment threats and wasted land potential.
                </p>
                <p>
                  After struggling to find a trustworthy, professional farm management service in
                  Anantapur, we decided to build one. GreenField Farm Care was launched to give landowners
                  exactly what they need: a dependable, transparent, local team that treats your farm
                  like their own.
                </p>
                <p>
                  Today we serve landowners across Anantapur district with a team of trained field
                  staff, certified irrigation technicians, security personnel and a dedicated operations
                  manager.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🌾', value: '50+', label: 'Acres Under Management' },
                  { icon: '👥', value: '20+', label: 'Happy Farm Owners' },
                  { icon: '🔧', value: '7', label: 'Services Offered' },
                  { icon: '📍', value: '10+', label: 'Mandals Covered' },
                ].map((stat, i) => (
                  <div key={stat.label} className="card p-6 text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <p className="font-heading font-extrabold text-gf-dark text-2xl">{stat.value}</p>
                    <p className="text-gf-muted text-xs font-body mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Trust Cards */}
      <section className="section-pad bg-white">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Why Trust Us" title="Our Commitments to You" subtitle="Not promises — written commitments that are part of every service agreement." />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {trustCards.map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.08}>
                <div className="card p-7 flex items-start gap-5 h-full">
                  <div className="w-12 h-12 bg-gf-pale rounded-xl flex items-center justify-center text-2xl shrink-0">{card.icon}</div>
                  <div>
                    <h3 className="font-heading font-bold text-gf-dark text-lg mb-2">{card.title}</h3>
                    <p className="text-gf-muted text-sm leading-relaxed font-body">{card.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="section-pad bg-gf-pale">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Service Area" title="Where We Operate" subtitle="We currently serve landowners across these mandals in Anantapur district." />
          <FadeIn className="mt-10">
            <div className="flex flex-wrap gap-3 justify-center">
              {serviceAreas.map(area => (
                <div key={area} className="flex items-center gap-1.5 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 text-sm font-body text-gf-dark">
                  <MapPin className="w-3.5 h-3.5 text-gf-mid shrink-0" />
                  {area}
                </div>
              ))}
              <div className="flex items-center gap-1.5 bg-gf-mid text-white rounded-full px-4 py-2 shadow-sm text-sm font-body font-semibold">
                + More expanding monthly
              </div>
            </div>
          </FadeIn>
          <FadeIn className="mt-8 text-center">
            <p className="text-gf-muted text-sm font-body">
              Don't see your area? <Link to="/contact" className="text-gf-mid font-semibold hover:underline">Contact us</Link> — we may still be able to help.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Values */}
      <section className="section-pad bg-gf-offwhite">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Our Values" title="How We Work" />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { title: 'Transparency First', desc: 'No hidden costs, no surprises. Every expense is documented and approved before work begins.' },
              { title: 'Local Knowledge', desc: 'We know Anantapur — the soil, the weather, the vendors, the regulations. That knowledge saves you money.' },
              { title: 'Long-term Partnership', desc: 'We\'re not a one-time contractor. We grow with your farm and adjust our services as your needs evolve.' },
            ].map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gf-dark rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Check className="w-6 h-6 text-gf-pale" />
                  </div>
                  <h3 className="font-heading font-bold text-gf-dark text-lg mb-2">{v.title}</h3>
                  <p className="text-gf-muted text-sm leading-relaxed font-body">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad gradient-hero text-white">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="section-heading text-white text-3xl md:text-4xl mb-5">
              Let's Talk About Your Farm
            </h2>
            <p className="text-white/70 text-lg mb-8 font-body">
              A 15-minute conversation is all it takes to understand if we're the right fit.
            </p>
            <Link to="/contact" className="btn-outline-white px-8 py-3.5 text-base">
              Get in Touch <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </Layout>
  )
}
