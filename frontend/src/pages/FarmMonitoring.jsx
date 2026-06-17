import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const steps = [
  {
    num: '01',
    title: 'Install Cameras',
    desc: 'Our team visits your farm and installs HD cameras at the best vantage points — gate, crop areas, boundaries.',
  },
  {
    num: '02',
    title: 'Get Live Access',
    desc: 'We set up live view on your phone within 24 hours. Watch your farm from anywhere in the world.',
  },
  {
    num: '03',
    title: 'Patrol & Alert',
    desc: 'Our field team does regular rounds. Motion alerts go straight to your WhatsApp the moment something is detected.',
  },
]

const features = [
  {
    icon: '📡',
    title: '24/7 Live View',
    desc: 'Access HD live footage from your smartphone anytime. No lag, no complicated apps — just open and watch.',
  },
  {
    icon: '🔔',
    title: 'Motion Alerts',
    desc: 'Instant WhatsApp notification with a snapshot when motion is detected at night or during off-hours.',
  },
  {
    icon: '☁️',
    title: 'Cloud Recording',
    desc: '30 days of cloud-stored footage. Review any moment from the past month if you need to check something.',
  },
  {
    icon: '📲',
    title: 'WhatsApp Snapshots',
    desc: 'Daily or on-demand photos of your farm sent straight to your WhatsApp. No need to open any app.',
  },
]

export default function FarmMonitoring() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gf-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-gf-pale text-gf-dark text-xs font-heading font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
            Live Camera Monitoring
          </span>
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl mb-6 max-w-3xl mx-auto">
            Watch Your Farm Live — From Anywhere in the World
          </h1>
          <p className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            HD cameras installed on your farm. Live view on your phone. Motion alerts on WhatsApp.
            Our team patrols regularly so nothing goes unnoticed.
          </p>
          <Link to="/contact" className="btn-outline inline-block text-base">
            Get Cameras Installed on My Farm
          </Link>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-20 bg-gf-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-heading text-3xl md:text-4xl">How It Works</h2>
            <p className="text-gray-500 mt-3">Three simple steps to secure live eyes on your farm.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gf-pale z-0" />
                )}
                <div className="relative z-10 w-16 h-16 rounded-full bg-gf-dark text-white flex items-center justify-center font-heading font-bold text-xl mb-5">
                  {step.num}
                </div>
                <h3 className="font-heading font-bold text-gf-dark text-xl mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Camera Features */}
      <section className="py-20 bg-gf-pale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-heading text-3xl md:text-4xl">What You Get with Our Cameras</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-gf-pale hover:shadow-md hover:border-gf-light transition-all duration-200 text-center"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-heading font-bold text-gf-dark text-lg mb-3">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Patrol Section */}
      <section className="py-20 bg-gf-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-heading font-semibold text-gf-light uppercase tracking-widest">
                Security Patrol
              </span>
              <h2 className="section-heading text-3xl md:text-4xl mt-3 mb-5">
                Eyes on the Ground, Not Just on Screen
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                Cameras catch everything on screen — but our field team is physically on your farm
                multiple times a month. They walk the perimeter, check for encroachments, verify
                fencing, and report any issues with photos the same day.
              </p>
              <ul className="space-y-3">
                {[
                  'Regular perimeter patrol rounds',
                  'Fence and gate integrity checks',
                  'Encroachment and trespass detection',
                  'Immediate photo report if anything is found',
                  'WhatsApp alert within 2 hours of detection',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-gf-light font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gf-pale rounded-2xl p-10 flex flex-col items-center text-center">
              <div className="text-6xl mb-6">🛡️</div>
              <h3 className="font-heading font-bold text-gf-dark text-2xl mb-3">
                Security is Part of Every Package
              </h3>
              <p className="text-gray-600 mb-6">
                Whether you choose Farm Watch or Full Farm Manager, security patrol is included.
                Your land is never unwatched.
              </p>
              <Link to="/services" className="btn-primary">
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gf-mid py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-white text-3xl mb-4">
            Ready to Watch Your Farm Live?
          </h2>
          <p className="text-white/80 mb-8">
            We install cameras, set up live access on your phone, and have your farm monitored
            within a week of your site visit.
          </p>
          <Link to="/contact" className="btn-outline inline-block text-base">
            Get Cameras Installed on My Farm
          </Link>
        </div>
      </section>
    </Layout>
  )
}
