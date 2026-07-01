import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Layout from '../components/Layout'

const highlights = [
  { icon: '👤', label: 'One Point of Contact' },
  { icon: '📹', label: 'Live Camera Access' },
  { icon: '📲', label: 'WhatsApp Reports' },
  { icon: '🔒', label: 'Security Patrols' },
  { icon: '💧', label: 'Drip Irrigation' },
  { icon: '🌱', label: 'Plantation & Care' },
]

export default function Home() {
  const { user } = useAuth()
  return (
    <Layout>

      {/* Hero */}
      <section
        className="relative bg-gf-dark text-white"
        style={{ backgroundImage: 'linear-gradient(135deg, #367C2B 0%, #2A6121 60%, #1d4a17 100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-block bg-gf-pale text-gf-dark text-xs font-heading font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
              Farm Management
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight mb-5">
              Your Farm.{' '}
              <span className="text-gf-pale">Fully Managed.</span>{' '}
              While You Work From Anywhere.
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              We handle everything your farm needs — so you always know it's in good hands.
            </p>

            {/* Highlights */}
            <div className="flex flex-wrap gap-2 mb-10">
              {highlights.map(h => (
                <span
                  key={h.label}
                  className="flex items-center gap-1.5 text-xs font-heading font-medium px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}
                >
                  {h.icon} {h.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="btn-primary text-center">Request a Free Site Visit</Link>
              <Link to="/services" className="btn-outline text-center">View Services</Link>
            </div>

            <div className="mt-8 pt-7 border-t border-white/20 flex items-center gap-4">
              <span className="text-white/40 text-sm">Already a customer?</span>
              {user ? (
                <Link to="/dashboard" className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-4 py-2 rounded-lg border border-white/20 transition-colors">
                  Dashboard →
                </Link>
              ) : (
                <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-4 py-2 rounded-lg border border-white/20 transition-colors">
                  Sign In →
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" className="w-full fill-gf-offwhite" preserveAspectRatio="none">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,50 L0,50 Z" />
          </svg>
        </div>
      </section>

      {/* CTA strip */}
      <section className="py-14 bg-gf-offwhite">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-gf-dark text-2xl md:text-3xl mb-3">
            Ready to put your farm in good hands?
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Request a free site visit — we assess your land and send a clear plan within 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary text-center">Request Free Site Visit</Link>
            <a
              href="https://wa.me/919945100567?text=Hi%2C%20I%20want%20to%20know%20more%20about%20GreenField%20Farm%20Care"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-heading font-semibold px-6 py-3 rounded-lg hover:bg-[#1ebe58] transition-colors"
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
