import { useState } from 'react'
import Layout from '../components/Layout'

const farmSizes = ['< 5 acres', '5 – 10 acres', '10 – 20 acres', '20+ acres']
const serviceOptions = [
  'Fencing',
  'Drip Irrigation',
  'Plantation',
  'Camera Installation',
  'Maintenance',
  'Security',
  'Not Sure Yet',
]

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    whatsapp: '',
    city: '',
    farmLocation: '',
    farmSize: '',
    services: [],
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleServiceToggle(service) {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('https://formspree.io/f/xpwzgvkq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.name,
          whatsapp: '+91' + form.whatsapp,
          city: form.city,
          farmLocation: form.farmLocation,
          farmSize: form.farmSize,
          services: form.services.join(', '),
        }),
      })
      setSubmitted(true)
    } catch (err) {
      alert('Something went wrong. Please call or WhatsApp us directly.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Layout>
        <section className="min-h-[70vh] flex items-center justify-center bg-gf-offwhite px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="font-heading font-bold text-gf-dark text-3xl mb-4">
              Request Received!
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Thank you, <strong>{form.name}</strong>. We will contact you on WhatsApp within
              24 hours to schedule your free site visit.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              WhatsApp number registered: {form.whatsapp}
            </p>
            <a
              href="https://wa.me/919945100567?text=Hi%2C%20I%20just%20submitted%20a%20site%20visit%20request%20on%20your%20website"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-heading font-semibold text-white transition-colors"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
                <path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.5-1.74A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.18 0-4.23-.6-5.99-1.64l-.43-.26-4.45 1.03 1.06-4.33-.28-.45A11.45 11.45 0 0 1 4.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zM22.5 19.1c-.34-.17-2-.98-2.31-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.31-.2.22-.39.25-.73.08-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.39.51-.59.17-.2.22-.34.34-.56.11-.22.06-.42-.03-.59-.08-.17-.77-1.85-1.05-2.53-.28-.67-.56-.58-.77-.59H10.9c-.22 0-.59.08-.9.42-.31.34-1.17 1.14-1.17 2.79s1.2 3.23 1.37 3.46c.17.22 2.36 3.6 5.72 5.05.8.34 1.42.55 1.91.7.8.25 1.53.22 2.11.13.64-.1 2-.82 2.28-1.61.28-.79.28-1.47.2-1.61-.08-.14-.3-.22-.64-.39z"/>
              </svg>
              Chat on WhatsApp Now
            </a>
          </div>
        </section>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gf-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">Contact Us</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Tell us about your farm and we will arrange a free site visit within 48 hours.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gf-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gf-pale p-8">
              <h2 className="font-heading font-bold text-gf-dark text-2xl mb-6">
                Request a Free Site Visit
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-heading font-semibold text-gf-dark mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gf-mid focus:ring-1 focus:ring-gf-mid transition-colors"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-heading font-semibold text-gf-dark mb-1">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="flex items-center px-3 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-sm text-gray-500 font-body">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="whatsapp"
                      required
                      value={form.whatsapp}
                      onChange={handleChange}
                      placeholder="9999999999"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      className="flex-1 border border-gray-200 rounded-r-lg px-4 py-3 text-sm focus:outline-none focus:border-gf-mid focus:ring-1 focus:ring-gf-mid transition-colors"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">We will contact you on this number</p>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-heading font-semibold text-gf-dark mb-1">
                    City You Live In <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Hyderabad, Bengaluru, Dubai"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gf-mid focus:ring-1 focus:ring-gf-mid transition-colors"
                  />
                </div>

                {/* Farm Location */}
                <div>
                  <label className="block text-sm font-heading font-semibold text-gf-dark mb-1">
                    Farm Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="farmLocation"
                    required
                    value={form.farmLocation}
                    onChange={handleChange}
                    placeholder="Village / Town, State"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gf-mid focus:ring-1 focus:ring-gf-mid transition-colors"
                  />
                </div>

                {/* Farm Size */}
                <div>
                  <label className="block text-sm font-heading font-semibold text-gf-dark mb-1">
                    Farm Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="farmSize"
                    required
                    value={form.farmSize}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gf-mid focus:ring-1 focus:ring-gf-mid transition-colors bg-white"
                  >
                    <option value="">Select approximate size</option>
                    {farmSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                {/* Services Needed */}
                <div>
                  <label className="block text-sm font-heading font-semibold text-gf-dark mb-2">
                    Services Needed
                    <span className="text-xs text-gray-400 font-normal ml-2">(select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map(service => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => handleServiceToggle(service)}
                        className={`px-4 py-2 rounded-full text-sm font-heading font-medium border transition-all duration-150 ${
                          form.services.includes(service)
                            ? 'bg-gf-mid text-white border-gf-mid'
                            : 'bg-white text-gf-dark border-gray-200 hover:border-gf-light'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gf-mid text-white font-heading font-semibold py-4 rounded-lg hover:bg-gf-light transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Sending...' : 'Request Free Site Visit'}
                </button>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                  {[
                    '✓ Response within 24 hours',
                    '✓ Free site visit',
                    '✓ Serving Farms Nationwide',
                  ].map(badge => (
                    <span key={badge} className="text-xs text-gf-mid font-heading font-semibold">
                      {badge}
                    </span>
                  ))}
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Quick Contact */}
              <div className="bg-white rounded-2xl border border-gf-pale p-6">
                <h3 className="font-heading font-bold text-gf-dark text-lg mb-4">
                  Prefer to Talk Now?
                </h3>
                <div className="space-y-3">
                  <a
                    href="tel:+919945100567"
                    className="flex items-center gap-3 w-full bg-gf-dark text-white font-heading font-semibold px-4 py-3 rounded-lg hover:bg-gf-mid transition-colors duration-200"
                  >
                    <span className="text-lg">📞</span>
                    Call Us Now
                  </a>
                  <a
                    href="https://wa.me/919945100567?text=Hi%2C%20I%27m%20interested%20in%20GreenField%20Farm%20Care"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full font-heading font-semibold px-4 py-3 rounded-lg text-white transition-colors duration-200"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white flex-shrink-0">
                      <path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.5-1.74A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.18 0-4.23-.6-5.99-1.64l-.43-.26-4.45 1.03 1.06-4.33-.28-.45A11.45 11.45 0 0 1 4.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zM22.5 19.1c-.34-.17-2-.98-2.31-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.31-.2.22-.39.25-.73.08-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.39.51-.59.17-.2.22-.34.34-.56.11-.22.06-.42-.03-.59-.08-.17-.77-1.85-1.05-2.53-.28-.67-.56-.58-.77-.59H10.9c-.22 0-.59.08-.9.42-.31.34-1.17 1.14-1.17 2.79s1.2 3.23 1.37 3.46c.17.22 2.36 3.6 5.72 5.05.8.34 1.42.55 1.91.7.8.25 1.53.22 2.11.13.64-.1 2-.82 2.28-1.61.28-.79.28-1.47.2-1.61-.08-.14-.3-.22-.64-.39z"/>
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-gf-pale rounded-2xl p-6">
                <h3 className="font-heading font-bold text-gf-dark text-base mb-4">
                  What Happens Next
                </h3>
                <ol className="space-y-3">
                  {[
                    'We call you within 24 hours',
                    'Schedule a free site visit',
                    'Assess your farm and needs',
                    'Send you a clear quote in 48 hours',
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-3 text-sm text-gf-dark">
                      <span className="w-5 h-5 rounded-full bg-gf-mid text-white text-xs flex items-center justify-center font-heading font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl border border-gf-pale p-6">
                <h3 className="font-heading font-bold text-gf-dark text-base mb-3">
                  📍 Where We Operate
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Currently serving farms across{' '}
                  <strong className="text-gf-dark">South India</strong>.
                  Expanding to more regions across the country.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
