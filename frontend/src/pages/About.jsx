import Layout from '../components/Layout'

const trustCards = [
  {
    icon: '🤝',
    title: 'One Dedicated Team',
    desc: 'A single point of contact manages your farm from start to finish. No confusion, no chasing multiple vendors.',
  },
  {
    icon: '👁️',
    title: 'Full Visibility From Anywhere',
    desc: 'Live cameras, WhatsApp photo updates and monthly reports mean you always know what is happening on your land.',
  },
  {
    icon: '💰',
    title: 'Honest Pricing',
    desc: 'We give you itemised quotes before work begins. No hidden charges, no surprises when the bill arrives.',
  },
  {
    icon: '📍',
    title: 'Local Expertise',
    desc: 'We know the land, the climate and the local vendors in every region we operate. That local knowledge makes us faster and better.',
  },
]

const serviceAreas = [
  { area: 'South India', status: 'primary', label: 'Fully Operational' },
  { area: 'West India', status: 'expanding', label: 'Expanding Soon' },
  { area: 'North India', status: 'expanding', label: 'Expanding Soon' },
  { area: 'East India', status: 'expanding', label: 'Expanding Soon' },
]

export default function About() {
  return (
    <Layout>
      {/* Header */}
      <section className="bg-gf-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-6 max-w-3xl mx-auto">
            We Make Farm Ownership Simple, Secure and Stress-Free
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            GreenField Farm Care is a dedicated farm management company — built for
            city-based farm owners who want their land productive and protected without being there.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 bg-gf-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-heading font-semibold text-gf-light uppercase tracking-widest">
                Who We Are
              </span>
              <h2 className="section-heading text-3xl md:text-4xl mt-3 mb-6">
                Your Farm's Trusted Local Team
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  GreenField Farm Care was founded to solve a problem that thousands of
                  farm owners face: they own land, but live and work in Hyderabad,
                  Bengaluru, Chennai or other cities. Their farms sit idle or poorly managed
                  because they cannot be there.
                </p>
                <p>
                  We are a dedicated team of farm managers, field staff and technical
                  specialists. We handle fencing, irrigation, plantation, camera monitoring and
                  ongoing maintenance — everything from the first site visit to monthly reports
                  delivered on your WhatsApp.
                </p>
                <p>
                  Our customers are busy professionals and NRI families who want their land
                  productive and secure. We give them full visibility without the need to travel
                  — and complete peace of mind.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '7+', label: 'Services Offered' },
                { num: '100%', label: 'Transparent Reporting' },
                { num: '48h', label: 'Quote Turnaround' },
                { num: '1', label: 'Point of Contact' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="bg-gf-pale rounded-2xl p-6 text-center border border-gf-pale"
                >
                  <div className="font-heading font-extrabold text-gf-dark text-4xl mb-2">
                    {stat.num}
                  </div>
                  <div className="text-gray-600 text-sm font-body">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Cards */}
      <section className="py-20 bg-gf-pale">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-heading text-3xl md:text-4xl">What Makes Us Different</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustCards.map(card => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-6 border border-gf-pale hover:shadow-md hover:border-gf-light transition-all duration-200 text-center"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="font-heading font-bold text-gf-dark text-lg mb-3">{card.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gf-offwhite">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-heading font-semibold text-gf-light uppercase tracking-widest">
              Our Story
            </span>
            <h2 className="section-heading text-3xl md:text-4xl mt-3">
              Built From a Real Problem
            </h2>
          </div>
          <div className="bg-white rounded-2xl border border-gf-pale p-8 md:p-12 space-y-5 text-gray-600 leading-relaxed">
            <p>
              Our founder spent years watching farm owners — both local families and
              city-based professionals — struggle to manage their agricultural land.
              Vendors would over-charge, work would be done poorly, and owners would only find
              out months later during a rare visit.
            </p>
            <p>
              The question was simple: <em className="text-gf-dark font-medium">why can't someone
              just handle everything, the right way, at a fair price?</em>
            </p>
            <p>
              GreenField Farm Care was built to be that company. We are not just contractors —
              we take responsibility for your farm the way an owner would. We schedule the work,
              manage the vendors, do quality checks, and send you updates every step of the way.
            </p>
            <p>
              We are currently operational across South India where our team, local knowledge and
              vendor relationships are strongest. We are expanding to more regions across India
              as our team grows.
            </p>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-20 bg-gf-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            Where We Operate
          </h2>
          <p className="text-white/70 mb-10 max-w-xl mx-auto">
            Currently serving farms across South India.
            Expanding to more regions as we grow.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {serviceAreas.map(area => (
              <div
                key={area.area}
                className={`rounded-xl p-5 border ${
                  area.status === 'primary'
                    ? 'border-gf-light bg-gf-mid/50'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <div className="font-heading font-semibold text-white text-base mb-1">
                  {area.area}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-heading font-medium ${
                    area.status === 'primary'
                      ? 'bg-gf-pale text-gf-dark'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {area.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
