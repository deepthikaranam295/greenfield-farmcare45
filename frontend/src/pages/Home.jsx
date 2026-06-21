import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'

const whyCards = [
  {
    icon: '👤',
    title: 'One Point of Contact',
    desc: 'A single dedicated manager handles everything on your farm. No juggling multiple vendors.',
  },
  {
    icon: '📹',
    title: 'Watch Your Farm Live',
    desc: 'CCTV cameras with live access on your phone. See your farm from anywhere in the world.',
  },
  {
    icon: '📅',
    title: 'Clear Timelines',
    desc: 'Every task comes with a scheduled date and a completion update. No surprises.',
  },
  {
    icon: '🔒',
    title: 'Reliable Security',
    desc: 'Regular security patrols and motion alerts keep your land safe 24 hours a day.',
  },
  {
    icon: '💰',
    title: 'Transparent Pricing',
    desc: 'Itemised quotes before any work begins. You know exactly what you are paying for.',
  },
  {
    icon: '📲',
    title: 'Monthly Reports on WhatsApp',
    desc: 'Photo reports and updates sent directly to your WhatsApp every month.',
  },
]

const services = [
  { icon: '🌿', label: 'Fencing' },
  { icon: '💧', label: 'Drip Irrigation' },
  { icon: '🌱', label: 'Plantation' },
  { icon: '📡', label: 'Live Monitoring' },
  { icon: '🔧', label: 'Farm Maintenance' },
  { icon: '🛡️', label: 'Security' },
]

export default function Home() {
  const { user } = useAuth()
  return (
    <Layout>
      {/* Hero */}
      <section
        className="relative bg-gf-dark text-white"
        style={{
          backgroundImage:
            'linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <span className="inline-block bg-gf-pale text-gf-dark text-xs font-heading font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
              Smart Farm Management
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Your Farm.{' '}
              <span className="text-gf-pale">Fully Managed.</span>{' '}
              While You Work From Anywhere.
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-10">
              We handle everything — fencing, irrigation, planting, security and live camera
              monitoring — so you never have to worry about what is happening on your land.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="btn-primary text-center text-base">
                Request a Free Site Visit
              </Link>
              <Link to="/services" className="btn-outline text-center text-base">
                View Our Services
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-white/20 flex items-center gap-4">
              <span className="text-white/50 text-sm font-body">Already a customer?</span>
              {user ? (
                <Link to="/dashboard" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-heading font-semibold text-sm px-5 py-2.5 rounded-xl border border-white/20 transition-colors">
                  Go to Dashboard →
                </Link>
              ) : (
                <Link to="/login" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-heading font-semibold text-sm px-5 py-2.5 rounded-xl border border-white/20 transition-colors">
                  Sign In →
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full fill-gf-offwhite" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gf-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-heading text-3xl md:text-4xl mb-4">Why Choose GreenField?</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              We are not a contractor — we are your dedicated farm management team.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyCards.map(card => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gf-pale hover:shadow-md hover:border-gf-light transition-all duration-200"
              >
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="font-heading font-semibold text-gf-dark text-lg mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Strip */}
      <section className="py-14 bg-gf-pale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-heading text-2xl md:text-3xl text-center mb-10">
            Everything Your Farm Needs
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
            {services.map(s => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl">
                  {s.icon}
                </div>
                <span className="text-gf-dark font-heading font-medium text-xs text-center">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/services" className="btn-primary inline-block">
              See All Services & Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-gf-dark py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-white text-center">
            {[
              '7 Services Offered',
              'Nationwide Coverage',
              '100% Transparent Reporting',
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="hidden sm:block w-px h-8 bg-gf-light/40" />
                )}
                <span className="font-heading font-semibold text-gf-pale text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gf-mid py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-white text-3xl md:text-4xl mb-4">
            Ready to Put Your Farm in Good Hands?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Book a free site visit — we come to your farm, assess the land, and give you a
            clear plan and quote within 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-outline text-center text-base">
              Request Free Site Visit
            </Link>
            <a
              href="https://wa.me/919945100567?text=Hi%2C%20I%20want%20to%20know%20more%20about%20GreenField%20Farm%20Care"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-heading font-semibold px-6 py-3 rounded-lg hover:bg-[#1ebe58] transition-colors duration-200"
            >
              <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
                <path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.5-1.74A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.18 0-4.23-.6-5.99-1.64l-.43-.26-4.45 1.03 1.06-4.33-.28-.45A11.45 11.45 0 0 1 4.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zM22.5 19.1c-.34-.17-2-.98-2.31-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.31-.2.22-.39.25-.73.08-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.39.51-.59.17-.2.22-.34.34-.56.11-.22.06-.42-.03-.59-.08-.17-.77-1.85-1.05-2.53-.28-.67-.56-.58-.77-.59H10.9c-.22 0-.59.08-.9.42-.31.34-1.17 1.14-1.17 2.79s1.2 3.23 1.37 3.46c.17.22 2.36 3.6 5.72 5.05.8.34 1.42.55 1.91.7.8.25 1.53.22 2.11.13.64-.1 2-.82 2.28-1.61.28-.79.28-1.47.2-1.61-.08-.14-.3-.22-.64-.39z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}
