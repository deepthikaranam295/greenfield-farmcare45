import { Link } from 'react-router-dom'
import { Check, ArrowRight, Star } from 'lucide-react'
import Layout from '../components/Layout'
import FadeIn from '../components/ui/FadeIn'
import SectionHeading from '../components/ui/SectionHeading'
import { services, packages } from '../data/services'

export default function Services() {
  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero text-white py-20 md:py-28">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="section-label text-gf-pale">Our Services</span>
            <h1 className="section-heading text-white text-4xl md:text-5xl mt-2 mb-5">
              Every Service Your Farm Needs
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto font-body">
              From boundary fencing to live CCTV — we offer 7 professional services tailored for
              farmland in Anantapur district.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-pad bg-gf-offwhite">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="All Services" title="What We Do" subtitle="Transparent pricing, professional execution, guaranteed results." />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <FadeIn key={svc.id} delay={i * 0.07}>
                <div className="card p-6 h-full flex flex-col group hover:-translate-y-1 transition-transform duration-200">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gf-pale rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      {svc.icon}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-gf-dark text-lg leading-tight">{svc.title}</h3>
                      <p className="text-gf-light text-xs font-body font-medium mt-0.5">{svc.tagline}</p>
                    </div>
                  </div>
                  <p className="text-gf-muted text-sm leading-relaxed font-body mb-5">{svc.description}</p>
                  <div className="flex-1">
                    <p className="text-xs font-heading font-semibold text-gf-dark uppercase tracking-wide mb-3">What's Included</p>
                    <ul className="space-y-1.5 mb-5">
                      {svc.included.map(item => (
                        <li key={item} className="flex items-start gap-2 text-sm font-body text-gf-muted">
                          <Check className="w-4 h-4 text-gf-light mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-gray-100 pt-4 mt-auto flex items-end justify-between">
                    <div>
                      <p className="font-heading font-extrabold text-gf-dark text-xl">{svc.price}</p>
                      <p className="text-gray-400 text-xs font-body">{svc.priceNote}</p>
                    </div>
                    <Link to="/contact" className="btn-outline-green text-sm py-2 px-4">
                      Enquire
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="section-pad bg-white">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Packages"
            title="Choose the Right Plan"
            subtitle="Bundled packages designed for different levels of farm management needs."
          />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {packages.map((pkg, i) => (
              <FadeIn key={pkg.name} delay={i * 0.1}>
                <div className={`rounded-2xl p-7 h-full flex flex-col relative ${
                  pkg.highlight
                    ? 'bg-gf-dark text-white shadow-2xl ring-2 ring-gf-light scale-105'
                    : 'bg-white border border-gray-200 shadow-sm'
                }`}>
                  {pkg.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 bg-gf-light text-white text-xs font-heading font-bold px-3 py-1 rounded-full shadow">
                        <Star className="w-3 h-3 fill-white" /> {pkg.badge}
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <p className={`font-heading font-bold text-xl mb-1 ${pkg.highlight ? 'text-white' : 'text-gf-dark'}`}>
                      {pkg.name}
                    </p>
                    <p className={`font-heading font-extrabold text-3xl ${pkg.highlight ? 'text-gf-pale' : 'text-gf-dark'}`}>
                      {pkg.price}
                    </p>
                    <p className={`text-xs font-body mt-0.5 ${pkg.highlight ? 'text-white/60' : 'text-gray-400'}`}>
                      {pkg.period}
                    </p>
                  </div>
                  <ul className="space-y-3 flex-1 mb-7">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm font-body">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${pkg.highlight ? 'text-gf-pale' : 'text-gf-light'}`} />
                        <span className={pkg.highlight ? 'text-white/80' : 'text-gf-muted'}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className={pkg.highlight ? 'btn-outline-white text-center' : 'btn-primary text-center'}
                  >
                    {pkg.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="mt-10 text-center">
            <p className="text-gf-muted text-sm font-body">
              Need a custom plan? <Link to="/contact" className="text-gf-mid font-semibold hover:underline">Talk to us</Link> — we tailor to every farm.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad gradient-hero text-white">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="section-heading text-white text-3xl md:text-4xl mb-5">
              Not Sure Which Service You Need?
            </h2>
            <p className="text-white/70 text-lg mb-8 font-body max-w-xl mx-auto">
              Book a free site visit and we'll recommend the right services for your land.
            </p>
            <Link to="/contact" className="btn-outline-white px-8 py-3.5 text-base">
              Book Free Site Visit <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </Layout>
  )
}
