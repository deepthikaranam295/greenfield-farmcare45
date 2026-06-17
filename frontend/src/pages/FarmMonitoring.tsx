import { Link } from 'react-router-dom'
import { Check, ArrowRight, Wifi, Moon, Zap, Bell, Smartphone } from 'lucide-react'
import Layout from '../components/Layout'
import FadeIn from '../components/ui/FadeIn'
import SectionHeading from '../components/ui/SectionHeading'

const cameraFeatures = [
  { icon: <Wifi className="w-5 h-5 text-gf-light" />, title: '4G Connectivity', desc: 'No broadband required — works on mobile network anywhere in the district.' },
  { icon: <Moon className="w-5 h-5 text-gf-light" />, title: 'Night Vision', desc: 'Full-colour night vision up to 30 meters. See everything after dark.' },
  { icon: <Zap className="w-5 h-5 text-gf-light" />, title: 'Solar Powered', desc: 'Runs entirely on solar energy. No electricity needed at the farm.' },
  { icon: <Bell className="w-5 h-5 text-gf-light" />, title: 'Motion Alerts', desc: 'Instant WhatsApp alerts when movement is detected on your land.' },
  { icon: <Smartphone className="w-5 h-5 text-gf-light" />, title: 'Mobile App', desc: 'Watch your farm live on your phone from anywhere in the world.' },
  { icon: <Check className="w-5 h-5 text-gf-light" />, title: '1-Year Warranty', desc: 'All hardware comes with 1-year warranty and free replacement.' },
]

const steps = [
  { step: '01', title: 'We Install the Cameras', desc: 'Our team visits your farm, identifies the best camera positions, and installs solar-powered 4G cameras in 1–2 days.' },
  { step: '02', title: 'We Set Up Your App', desc: 'We configure the mobile app on your phone with live view, recordings, and motion alert settings. Training included.' },
  { step: '03', title: 'You Watch Live 24×7', desc: 'Log in from anywhere in the world and see your farm in real time. Recordings saved for 30 days in the cloud.' },
]

export default function FarmMonitoring() {
  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero text-white py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full border border-white" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full border border-white" />
        </div>
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <FadeIn>
            <span className="section-label text-gf-pale">Live Monitoring & Security</span>
            <h1 className="section-heading text-white text-4xl md:text-5xl lg:text-6xl mt-2 mb-6 max-w-4xl mx-auto text-balance">
              Watch Your Farm Live — From Anywhere in the World
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-body mb-10">
              Solar-powered 4G cameras with night vision, motion alerts and 30-day cloud recordings —
              all accessible from your phone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-outline-white px-8 py-3.5 text-base">
                Get Cameras Installed <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://wa.me/919945100567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-heading font-semibold px-8 py-3.5 rounded-lg hover:bg-[#1ebe58] transition-colors text-base"
              >
                Ask on WhatsApp
              </a>
            </div>
          </FadeIn>
        </div>
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 64" className="w-full fill-gf-offwhite" preserveAspectRatio="none" height="64">
            <path d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z" />
          </svg>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="section-pad bg-gf-offwhite">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="How It Works" title="Up and Running in 3 Steps" />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <FadeIn key={s.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gf-dark rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                    <span className="font-heading font-extrabold text-gf-pale text-xl">{s.step}</span>
                  </div>
                  <h3 className="font-heading font-bold text-gf-dark text-xl mb-3">{s.title}</h3>
                  <p className="text-gf-muted text-sm leading-relaxed font-body max-w-xs mx-auto">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Camera Features */}
      <section className="section-pad bg-white">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Camera Features" title="Professional-Grade Equipment" subtitle="Every camera is purpose-built for rural farm environments." />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cameraFeatures.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div className="card p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-gf-pale rounded-lg flex items-center justify-center shrink-0">{f.icon}</div>
                  <div>
                    <p className="font-heading font-semibold text-gf-dark text-base mb-1">{f.title}</p>
                    <p className="text-gf-muted text-sm font-body leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Security Patrol */}
      <section className="section-pad bg-gf-pale">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeIn>
              <span className="section-label text-gf-mid">Security Patrol</span>
              <h2 className="section-heading text-3xl md:text-4xl mt-2 mb-5">
                Eyes on Your Farm — On the Ground Too
              </h2>
              <p className="text-gf-muted leading-relaxed font-body mb-6">
                Cameras cover the farm visually, but nothing replaces a trained guard on the ground.
                Our security patrol team conducts scheduled rounds, maintains an entry log, and responds
                to any incident immediately.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Trained guards with verifiable background',
                  'Day and night patrol schedules',
                  'Visitor and vehicle entry log',
                  'Emergency response within 30 minutes',
                  'Monthly security incident report',
                  'Coordination with local police chowki',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-gf-dark font-body text-sm">
                    <Check className="w-4 h-4 text-gf-light shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="btn-primary">
                Enquire About Security <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <p className="font-heading font-bold text-gf-dark text-xl mb-6">Security Package Pricing</p>
                <div className="space-y-4">
                  {[
                    { label: 'Day Patrol (6 AM–6 PM)', price: '₹8,000/mo' },
                    { label: 'Night Patrol (6 PM–6 AM)', price: '₹10,000/mo' },
                    { label: '24×7 Guard Deployment', price: '₹16,000/mo' },
                    { label: 'Camera + Patrol Combo', price: '₹20,000/mo' },
                  ].map(p => (
                    <div key={p.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <span className="font-body text-gf-muted text-sm">{p.label}</span>
                      <span className="font-heading font-bold text-gf-dark">{p.price}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-400 text-xs font-body mt-4">All prices per farm gate · GST extra</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad gradient-hero text-white">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="section-heading text-white text-3xl md:text-4xl mb-5">
              Start Watching Your Farm Today
            </h2>
            <p className="text-white/70 text-lg mb-8 font-body">
              Camera installation takes just 1–2 days. Get started with a free site assessment.
            </p>
            <Link to="/contact" className="btn-outline-white px-8 py-3.5 text-base">
              Book Free Assessment <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </Layout>
  )
}
