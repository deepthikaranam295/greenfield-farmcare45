import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const oneTimeServices = [
  {
    icon: '🌿',
    title: 'Fencing',
    price: 'from ₹15,000/acre',
    desc: 'Barbed wire, chain link, or compound wall fencing to secure your farm perimeter. Includes material, labour and post installation.',
    features: ['Site survey included', 'Quality materials', 'Completion in 7–14 days'],
  },
  {
    icon: '💧',
    title: 'Drip Irrigation',
    price: 'from ₹20,000/acre',
    desc: 'End-to-end drip irrigation design and installation. Water-efficient systems that save up to 60% water compared to flood irrigation.',
    features: ['Soil analysis included', 'Emitter placement design', 'Filter & pump setup'],
  },
  {
    icon: '🗺️',
    title: 'Field Mapping',
    price: '₹2,000 flat',
    desc: 'GPS mapping of your farm boundaries and internal plot divisions. Accurate digital maps for planning and records.',
    features: ['GPS accuracy ±1 metre', 'Digital file provided', 'Same-day visit'],
  },
  {
    icon: '🌱',
    title: 'Plantation',
    price: 'from ₹10,000/acre',
    desc: 'Fruit trees, timber, or mixed plantation based on your goals. Includes soil preparation, sapling procurement and planting.',
    features: ['Variety selection guidance', 'Quality saplings', 'First month monitoring'],
  },
  {
    icon: '📷',
    title: 'Camera Installation',
    price: 'from ₹8,000/point',
    desc: 'HD CCTV cameras with live mobile access and cloud recording. Motion alerts sent directly to your WhatsApp.',
    features: ['Live mobile view', 'Motion alerts', 'Cloud storage 30 days'],
  },
]

const ongoingServices = [
  {
    icon: '🔧',
    title: 'Farm Maintenance',
    price: '₹5,000 – ₹14,000/month',
    desc: 'Regular upkeep of your farm — weeding, fence checks, irrigation maintenance, tree care and general land management. Monthly photo report included.',
    features: ['Monthly visit schedule', 'WhatsApp photo reports', 'Issue escalation same day'],
  },
  {
    icon: '🛡️',
    title: 'Security Patrol',
    price: 'Included in packages',
    desc: 'Regular security rounds by our field team. Camera monitoring and immediate alerts for any suspicious activity on your land.',
    features: ['Regular patrol rounds', 'Camera monitoring', 'Incident reporting'],
  },
]

const packages = [
  {
    name: 'Farm Ready',
    tag: null,
    tagline: 'Get your land set up and secured.',
    includes: [
      'Field mapping',
      'Fencing (perimeter)',
      'One-time visit report',
      'WhatsApp updates',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Farm Watch',
    tag: null,
    tagline: 'Ongoing monitoring with monthly reports.',
    includes: [
      'Everything in Farm Ready',
      'Camera installation (2 points)',
      'Monthly maintenance visit',
      'Monthly photo report on WhatsApp',
      'Security patrol (2× month)',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Full Farm Manager',
    tag: 'Most Popular',
    tagline: 'Complete hands-off farm management.',
    includes: [
      'Everything in Farm Watch',
      'Drip irrigation setup',
      'Plantation (if needed)',
      'Vendor coordination',
      'Weekly updates',
      'Dedicated farm manager',
      'Priority response',
    ],
    cta: 'Get Started',
  },
]

export default function Services() {
  return (
    <Layout>
      {/* Header */}
      <section className="bg-gf-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">
            What We Do For Your Farm
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            From the first fence post to live camera monitoring — every service your farm needs,
            handled by one trusted team.
          </p>
        </div>
      </section>

      {/* One-Time Setup */}
      <section className="py-20 bg-gf-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-heading font-semibold text-gf-light uppercase tracking-widest">
              One-Time Setup
            </span>
            <h2 className="section-heading text-3xl md:text-4xl mt-2">
              Establish & Secure Your Farm
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {oneTimeServices.map(s => (
              <div
                key={s.title}
                className="bg-white rounded-2xl border border-gf-pale p-6 hover:shadow-md hover:border-gf-light transition-all duration-200 flex flex-col"
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-heading font-bold text-gf-dark text-xl mb-1">{s.title}</h3>
                <span className="text-gf-mid font-heading font-semibold text-sm mb-3">
                  {s.price}
                </span>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">{s.desc}</p>
                <ul className="space-y-1">
                  {s.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="text-gf-light">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ongoing Services */}
      <section className="py-20 bg-gf-pale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-heading font-semibold text-gf-light uppercase tracking-widest">
              Ongoing Services
            </span>
            <h2 className="section-heading text-3xl md:text-4xl mt-2">
              Continuous Care, Month After Month
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ongoingServices.map(s => (
              <div
                key={s.title}
                className="bg-white rounded-2xl border border-gf-pale p-8 hover:shadow-md hover:border-gf-light transition-all duration-200"
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-heading font-bold text-gf-dark text-2xl mb-1">{s.title}</h3>
                <span className="text-gf-mid font-heading font-semibold text-sm mb-4 block">
                  {s.price}
                </span>
                <p className="text-gray-600 leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2">
                  {s.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="text-gf-light font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 bg-gf-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-heading font-semibold text-gf-light uppercase tracking-widest">
              Packages
            </span>
            <h2 className="section-heading text-3xl md:text-4xl mt-2">
              Choose the Right Plan for Your Farm
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              All packages include a free initial site visit and a custom quote based on your farm size.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {packages.map(pkg => (
              <div
                key={pkg.name}
                className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                  pkg.tag
                    ? 'border-gf-mid bg-gf-dark text-white shadow-xl'
                    : 'border-gf-pale bg-white text-gf-dark'
                }`}
              >
                {pkg.tag && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gf-light text-white text-xs font-heading font-bold px-4 py-1 rounded-full">
                    {pkg.tag}
                  </span>
                )}
                <h3 className="font-heading font-bold text-2xl mb-2">{pkg.name}</h3>
                <p
                  className={`text-sm mb-6 ${pkg.tag ? 'text-gf-pale/80' : 'text-gray-500'}`}
                >
                  {pkg.tagline}
                </p>
                <ul className="space-y-3 flex-grow mb-8">
                  {pkg.includes.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className={pkg.tag ? 'text-gf-pale' : 'text-gf-light'}>✓</span>
                      <span className={pkg.tag ? 'text-white/90' : 'text-gray-600'}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`block text-center font-heading font-semibold py-3 rounded-lg transition-colors duration-200 ${
                    pkg.tag
                      ? 'bg-gf-light text-white hover:bg-gf-pale hover:text-gf-dark'
                      : 'bg-gf-mid text-white hover:bg-gf-light'
                  }`}
                >
                  {pkg.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gf-dark py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-white text-3xl mb-4">
            Not Sure Which Service You Need?
          </h2>
          <p className="text-white/70 mb-8">
            Request a free site visit. We assess your farm and recommend exactly what is needed.
          </p>
          <Link to="/contact" className="btn-outline inline-block">
            Request Free Site Visit
          </Link>
        </div>
      </section>
    </Layout>
  )
}
