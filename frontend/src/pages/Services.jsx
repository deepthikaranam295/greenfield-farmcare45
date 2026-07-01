import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const services = [
  { icon: '🌿', title: 'Fencing',             desc: 'Perimeter fencing to secure your farm boundary.' },
  { icon: '💧', title: 'Drip Irrigation',      desc: 'End-to-end drip system design and installation.' },
  { icon: '🗺️', title: 'Field Mapping',        desc: 'GPS mapping of your farm boundaries and plots.' },
  { icon: '🌱', title: 'Plantation',           desc: 'Sapling procurement, soil prep and planting.' },
  { icon: '📷', title: 'Camera Installation',  desc: 'HD cameras with live mobile access and alerts.' },
  { icon: '💧', title: 'Irrigation Management',desc: 'Scheduled field visits to operate water systems.' },
  { icon: '🌿', title: 'Fertilizer Application',desc: 'Soil-based nutrient management with photo reports.' },
  { icon: '🐛', title: 'Pest Control',         desc: 'Pest identification and targeted treatment.' },
  { icon: '🔭', title: 'Crop Monitoring',      desc: 'Regular walkthroughs with WhatsApp photo updates.' },
  { icon: '📋', title: 'Field Inspection',     desc: 'Full farm health check with detailed report.' },
  { icon: '🌾', title: 'Harvesting Support',   desc: 'Labour coordination and harvest supervision.' },
  { icon: '🔧', title: 'Farm Maintenance',     desc: 'Monthly upkeep — weeding, fence checks, tree care.' },
  { icon: '🛡️', title: 'Security Patrol',      desc: 'Regular security rounds and camera monitoring.' },
]

export default function Services() {
  return (
    <Layout>
      {/* Header */}
      <section className="bg-gf-dark text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">
            Our Services
          </h1>
          <p className="text-white/70 text-lg">
            Everything your farm needs — handled by one trusted team.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 bg-gf-offwhite">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
              <div
                key={s.title}
                className="bg-white rounded-xl border border-gf-pale px-5 py-5 flex items-start gap-4 hover:shadow-md hover:border-gf-light transition-all duration-200"
              >
                <span className="text-2xl mt-0.5">{s.icon}</span>
                <div>
                  <h3 className="font-heading font-semibold text-gf-dark text-base mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gf-dark py-14">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-white text-2xl mb-3">
            Not sure which service you need?
          </h2>
          <p className="text-white/60 mb-7">
            Request a free site visit — we'll assess your farm and recommend exactly what's needed.
          </p>
          <Link to="/contact" className="btn-outline inline-block">
            Request Free Site Visit
          </Link>
        </div>
      </section>
    </Layout>
  )
}
