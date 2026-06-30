import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const oneTimeServices = [
  {
    icon: '🌿',
    title: 'Fencing',
    desc: 'Barbed wire, chain link, or compound wall fencing to secure your farm perimeter. Includes material, labour and post installation.',
    features: ['Site survey included', 'Quality materials', 'Completion in 7–14 days'],
  },
  {
    icon: '💧',
    title: 'Drip Irrigation',
    desc: 'End-to-end drip irrigation design and installation. Water-efficient systems that save up to 60% water compared to flood irrigation.',
    features: ['Soil analysis included', 'Emitter placement design', 'Filter & pump setup'],
  },
  {
    icon: '🗺️',
    title: 'Field Mapping',
    desc: 'GPS mapping of your farm boundaries and internal plot divisions. Accurate digital maps for planning and records.',
    features: ['GPS accuracy ±1 metre', 'Digital file provided', 'Same-day visit'],
  },
  {
    icon: '🌱',
    title: 'Plantation',
    desc: 'Fruit trees, timber, or mixed plantation based on your goals. Includes soil preparation, sapling procurement and planting.',
    features: ['Variety selection guidance', 'Quality saplings', 'First month monitoring'],
  },
  {
    icon: '📷',
    title: 'Camera Installation',
    desc: 'HD CCTV cameras with live mobile access and cloud recording. Motion alerts sent directly to your WhatsApp.',
    features: ['Live mobile view', 'Motion alerts', 'Cloud storage 30 days'],
  },
]

const fieldOperations = [
  {
    icon: '💧',
    title: 'Irrigation',
    desc: 'Scheduled and on-demand irrigation services — drip, sprinkler, and flood irrigation. Field team visits to check and operate water systems.',
    features: ['Scheduled visits', 'Pump & valve checks', 'Water usage log'],
  },
  {
    icon: '🌿',
    title: 'Fertilizer Application',
    desc: 'Soil-based nutrient management. Our field team applies fertilizers at the right dose, right time — with before/after photo reports.',
    features: ['Soil analysis review', 'Dosage planning', 'Application report'],
  },
  {
    icon: '🐛',
    title: 'Pest Control',
    desc: 'Identification and treatment of crop pests and diseases. Integrated pest management with minimal chemical use.',
    features: ['Pest identification', 'Targeted treatment', 'Follow-up inspection'],
  },
  {
    icon: '🔭',
    title: 'Crop Monitoring',
    desc: 'Regular field walkthroughs to track crop growth, identify issues early, and document progress with photos shared via WhatsApp.',
    features: ['Weekly/fortnightly visits', 'Growth stage tracking', 'Photo report'],
  },
  {
    icon: '📋',
    title: 'Field Inspection',
    desc: 'Comprehensive farm health checks — soil condition, irrigation status, fence integrity, and overall farm state documented in a field report.',
    features: ['Full farm walkthrough', 'Detailed field report', 'Issue escalation'],
  },
  {
    icon: '🌾',
    title: 'Harvesting Support',
    desc: 'Coordination and supervision of harvest operations. Labour arrangement, equipment coordination, and produce transport support.',
    features: ['Labour coordination', 'Equipment supervision', 'Produce handling'],
  },
]

const ongoingServices = [
  {
    icon: '🔧',
    title: 'Farm Maintenance',
    desc: 'Regular upkeep of your farm — weeding, fence checks, irrigation maintenance, tree care and general land management. Monthly photo report included.',
    features: ['Monthly visit schedule', 'WhatsApp photo reports', 'Issue escalation same day'],
  },
  {
    icon: '🛡️',
    title: 'Security Patrol',
    desc: 'Regular security rounds by our field team. Camera monitoring and immediate alerts for any suspicious activity on your land.',
    features: ['Regular patrol rounds', 'Camera monitoring', 'Incident reporting'],
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
                <h3 className="font-heading font-bold text-gf-dark text-xl mb-3">{s.title}</h3>
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

      {/* Field Operations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-heading font-semibold text-gf-light uppercase tracking-widest">
              Field Operations
            </span>
            <h2 className="section-heading text-3xl md:text-4xl mt-2">
              Agricultural Services, Managed by Our Team
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl">
              Our field team handles the day-to-day work on your land — from irrigation runs to
              pest control — and sends you photo updates after every visit.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fieldOperations.map(s => (
              <div
                key={s.title}
                className="bg-gf-offwhite rounded-2xl border border-gf-pale p-6 hover:shadow-md hover:border-gf-light transition-all duration-200 flex flex-col"
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-heading font-bold text-gf-dark text-xl mb-3">{s.title}</h3>
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
          <p className="text-center mt-10 text-sm text-gray-500">
            All field operations are tracked in your customer portal and documented with photos.{' '}
            <Link to="/contact" className="text-gf-mid font-semibold hover:underline">Contact us →</Link>
          </p>
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
                <h3 className="font-heading font-bold text-gf-dark text-2xl mb-3">{s.title}</h3>
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
