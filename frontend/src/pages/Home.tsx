import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react'
import Layout from '../components/Layout'
import FadeIn from '../components/ui/FadeIn'
import SectionHeading from '../components/ui/SectionHeading'

const whyCards = [
  { icon: '👤', title: 'One Point of Contact', desc: 'A single dedicated farm manager handles everything. No juggling multiple contractors or vendors.' },
  { icon: '📹', title: 'Watch Your Farm Live', desc: 'Solar-powered 4G cameras with night vision. See your farm from anywhere in the world, anytime.' },
  { icon: '📅', title: 'Clear Timelines', desc: 'Every task comes with a scheduled date and a WhatsApp update when it\'s done. Zero surprises.' },
  { icon: '🛡️', title: 'Reliable Security', desc: 'Regular security patrols and motion-triggered camera alerts keep your land safe around the clock.' },
  { icon: '💰', title: 'Transparent Pricing', desc: 'Itemised quotes before any work begins. You approve the cost — we never surprise you with extras.' },
  { icon: '📲', title: 'Monthly Reports on WhatsApp', desc: 'Photo reports and written updates delivered straight to your WhatsApp every single month.' },
]

const serviceIcons = [
  { icon: '🌿', label: 'Fencing' },
  { icon: '💧', label: 'Drip Irrigation' },
  { icon: '🌱', label: 'Plantation' },
  { icon: '📡', label: 'Live Monitoring' },
  { icon: '🔧', label: 'Farm Maintenance' },
  { icon: '🛡️', label: 'Security Patrol' },
  { icon: '🗺️', label: 'Farm Mapping' },
]

const stats = [
  { value: '7', label: 'Services Offered' },
  { value: 'AP', label: 'Anantapur Specialists' },
  { value: '100%', label: 'Transparent Reporting' },
]

export default function Home() {
  return (
    <Layout>
      {/* ─── Hero ─── */}
      <section className="relative gradient-hero text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute -bottom-10 -left-10 w-96 h-96 rounded-full border-2 border-white" />
        </div>

        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-gf-pale text-xs font-heading font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20"
            >
              📍 Anantapur District · Andhra Pradesh
            </motion.span>

            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-6 text-balance">
              Your Farm in Anantapur.{' '}
              <span className="text-gf-pale">Fully Managed.</span>{' '}
              While You Work From Anywhere.
            </h1>

            <p className="text-white/75 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
              We handle everything on your farm — fencing, irrigation, planting, security and live camera
              monitoring — so you can focus on your career while your land grows in value.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact" className="btn-primary text-base px-8 py-3.5">
                Request a Free Site Visit <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/services" className="btn-outline-white text-base px-8 py-3.5">
                View Our Services
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap gap-5">
              {['No upfront commitment', '48-hr quote turnaround', 'Site visit is free'].map(t => (
                <div key={t} className="flex items-center gap-2 text-sm text-white/70 font-body">
                  <CheckCircle2 className="w-4 h-4 text-gf-pale shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 64" className="w-full fill-gf-offwhite" preserveAspectRatio="none" height="64">
            <path d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z" />
          </svg>
        </div>
      </section>

      {/* ─── Why Choose Us ─── */}
      <section className="section-pad bg-gf-offwhite">
        <div className="container-xl mx-auto">
          <SectionHeading
            label="Why GreenField"
            title="Everything Your Farm Needs. One Team."
            subtitle="We are not a contractor you call once — we are your dedicated farm management partner."
          />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyCards.map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.08}>
                <div className="card p-6 h-full group hover:-translate-y-1 transition-transform duration-200">
                  <div className="w-12 h-12 bg-gf-pale rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <h3 className="font-heading font-semibold text-gf-dark text-lg mb-2">{card.title}</h3>
                  <p className="text-gf-muted text-sm leading-relaxed font-body">{card.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services Strip ─── */}
      <section className="py-16 bg-gf-pale">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Our Services" title="Everything Your Farm Needs" />
          <div className="mt-10 grid grid-cols-4 sm:grid-cols-7 gap-4 sm:gap-6">
            {serviceIcons.map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.07}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    {s.icon}
                  </div>
                  <span className="text-gf-dark font-heading font-semibold text-xs">{s.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="text-center mt-10">
            <Link to="/services" className="btn-primary">
              See All Services & Pricing <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ─── Stats Banner ─── */}
      <section className="bg-gf-dark py-12">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {stats.map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.1}>
                <p className="font-heading font-extrabold text-4xl text-gf-pale mb-1">{s.value}</p>
                <p className="text-white/60 text-sm font-body uppercase tracking-wide">{s.label}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="section-pad bg-white">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="How It Works" title="Get Started in 3 Simple Steps" />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connecting line */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gf-pale" />
            {[
              { step: '01', title: 'Book a Free Site Visit', desc: 'We come to your farm, assess the land and understand your goals — completely free, no obligation.' },
              { step: '02', title: 'Get Your Custom Plan', desc: 'Within 48 hours we send a detailed plan with scope of work, timeline and transparent pricing.' },
              { step: '03', title: 'We Manage, You Relax', desc: 'Our team handles everything. You get monthly WhatsApp reports and live camera access.' },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.12}>
                <div className="text-center relative">
                  <div className="w-16 h-16 bg-gf-pale rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <span className="font-heading font-extrabold text-gf-dark text-xl">{item.step}</span>
                  </div>
                  <h3 className="font-heading font-bold text-gf-dark text-lg mb-3">{item.title}</h3>
                  <p className="text-gf-muted text-sm leading-relaxed font-body max-w-xs mx-auto">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="section-pad gradient-hero text-white">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="section-heading text-white text-3xl md:text-4xl lg:text-5xl mb-5 text-balance">
              Ready to Put Your Farm in Good Hands?
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto font-body">
              Book a free site visit — we come to your farm, assess the land and give you a clear plan
              and quote within 48 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-outline-white text-base px-8 py-3.5">
                Request Free Site Visit
              </Link>
              <a
                href="https://wa.me/919945100567?text=Hi%2C%20I%20want%20to%20know%20more%20about%20GreenField%20Farm%20Care"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-heading font-semibold px-8 py-3.5 rounded-lg hover:bg-[#1ebe58] active:scale-95 transition-all text-base"
              >
                <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white shrink-0">
                  <path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.5-1.74A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.18 0-4.23-.6-5.99-1.64l-.43-.26-4.45 1.03 1.06-4.33-.28-.45A11.45 11.45 0 0 1 4.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zM22.5 19.1c-.34-.17-2-.98-2.31-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.31-.2.22-.39.25-.73.08-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.39.51-.59.17-.2.22-.34.34-.56.11-.22.06-.42-.03-.59-.08-.17-.77-1.85-1.05-2.53-.28-.67-.56-.58-.77-.59H10.9c-.22 0-.59.08-.9.42-.31.34-1.17 1.14-1.17 2.79s1.2 3.23 1.37 3.46c.17.22 2.36 3.6 5.72 5.05.8.34 1.42.55 1.91.7.8.25 1.53.22 2.11.13.64-.1 2-.82 2.28-1.61.28-.79.28-1.47.2-1.61-.08-.14-.3-.22-.64-.39z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-white/50 text-sm font-body">
              <Phone className="w-4 h-4" /> Call us: +91 99451 00567
            </div>
          </FadeIn>
        </div>
      </section>
    </Layout>
  )
}
