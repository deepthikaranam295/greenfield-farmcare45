import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, MapPin, Clock, Check } from 'lucide-react'
import Layout from '../components/Layout'
import FadeIn from '../components/ui/FadeIn'
import SectionHeading from '../components/ui/SectionHeading'

const services = ['Farm Fencing', 'Drip Irrigation', 'Farm Mapping', 'Plantation Setup', 'CCTV Cameras', 'Monthly Maintenance', 'Security Patrol', 'Full Farm Package']

interface FormState { name: string; whatsapp: string; city: string; farmLocation: string; farmSize: string; services: string[] }
const empty: FormState = { name: '', whatsapp: '', city: '', farmLocation: '', farmSize: '', services: [] }

export default function Contact() {
  const [form, setForm] = useState<FormState>(empty)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleService = (s: string) =>
    setForm(f => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s],
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Build WhatsApp message as fallback / primary delivery
    const msg = `*New Enquiry — GreenField Farm Care*
Name: ${form.name}
WhatsApp: ${form.whatsapp}
City: ${form.city}
Farm Location: ${form.farmLocation}
Farm Size: ${form.farmSize}
Services: ${form.services.join(', ') || 'Not specified'}`
    await new Promise(r => setTimeout(r, 800))
    window.open(`https://wa.me/919945100567?text=${encodeURIComponent(msg)}`, '_blank')
    setSent(true)
    setLoading(false)
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="gradient-hero text-white py-20 md:py-28">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="section-label text-gf-pale">Contact Us</span>
            <h1 className="section-heading text-white text-4xl md:text-5xl mt-2 mb-5">
              Let's Start With Your Farm
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto font-body">
              Fill in the form below and we'll get in touch within 2 hours to schedule a free site visit.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="section-pad bg-gf-offwhite">
        <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* Form */}
            <div className="lg:col-span-3">
              <FadeIn>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 sm:p-9">
                  <h2 className="font-heading font-bold text-gf-dark text-2xl mb-7">Request a Free Site Visit</h2>

                  {sent ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10"
                    >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-heading font-bold text-gf-dark text-xl mb-2">Message Sent!</h3>
                      <p className="text-gf-muted text-sm font-body mb-6">
                        Your enquiry has been sent to our WhatsApp. We'll respond within 2 hours.
                      </p>
                      <button onClick={() => { setSent(false); setForm(empty) }} className="btn-primary text-sm py-2 px-5">
                        Send Another Enquiry
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Full Name *" required value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Your name" />
                        <Field label="WhatsApp Number *" required value={form.whatsapp} onChange={v => setForm(f => ({ ...f, whatsapp: v }))} placeholder="+91 98765 00000" type="tel" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Your City *" required value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="e.g. Hyderabad" />
                        <Field label="Farm Location" value={form.farmLocation} onChange={v => setForm(f => ({ ...f, farmLocation: v }))} placeholder="Village / Mandal" />
                      </div>
                      <Field label="Farm Size (acres)" value={form.farmSize} onChange={v => setForm(f => ({ ...f, farmSize: v }))} placeholder="e.g. 5 acres" />

                      {/* Services */}
                      <div>
                        <label className="block text-sm font-body font-medium text-gray-700 mb-2">Services Needed</label>
                        <div className="grid grid-cols-2 gap-2">
                          {services.map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => toggleService(s)}
                              className={`text-left px-3 py-2 rounded-lg text-xs font-body border transition-all ${
                                form.services.includes(s)
                                  ? 'bg-gf-mid text-white border-gf-mid'
                                  : 'bg-white text-gf-muted border-gray-200 hover:border-gf-mid'
                              }`}
                            >
                              {form.services.includes(s) ? '✓ ' : ''}{s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3.5 text-base disabled:opacity-60"
                      >
                        {loading ? 'Sending…' : 'Send Enquiry via WhatsApp'}
                      </button>
                      <p className="text-gray-400 text-xs font-body text-center">
                        Your details will be sent to our WhatsApp. We respond within 2 hours.
                      </p>
                    </form>
                  )}
                </div>
              </FadeIn>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2 space-y-5">
              <FadeIn delay={0.1}>
                <div className="card p-6">
                  <p className="font-heading font-bold text-gf-dark text-lg mb-5">Get In Touch</p>
                  <div className="space-y-4">
                    <a href="tel:+919945100567" className="flex items-center gap-3 group">
                      <div className="w-10 h-10 bg-gf-pale rounded-xl flex items-center justify-center shrink-0 group-hover:bg-gf-mid transition-colors">
                        <Phone className="w-4 h-4 text-gf-mid group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-body">Call Us</p>
                        <p className="font-body font-semibold text-gf-dark text-sm">+91 99451 00567</p>
                      </div>
                    </a>
                    <a
                      href="https://wa.me/919945100567?text=Hi%2C%20I%20want%20to%20know%20more%20about%20GreenField%20Farm%20Care"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 bg-[#25D366]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#25D366] transition-colors">
                        <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-body">WhatsApp</p>
                        <p className="font-body font-semibold text-gf-dark text-sm">Chat Instantly</p>
                      </div>
                    </a>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gf-pale rounded-xl flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-gf-mid" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-body">Office</p>
                        <p className="font-body font-semibold text-gf-dark text-sm">Anantapur, AP — 515001</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gf-pale rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-gf-mid" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-body">Business Hours</p>
                        <p className="font-body font-semibold text-gf-dark text-sm">Mon–Sat, 8 AM–7 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Trust badges */}
              <FadeIn delay={0.18}>
                <div className="card p-6">
                  <p className="font-heading font-semibold text-gf-dark text-base mb-4">Why People Trust Us</p>
                  <ul className="space-y-3">
                    {[
                      'Free site visit — no obligation',
                      'Quote within 48 hours',
                      'Written agreement for every service',
                      'WhatsApp response within 2 hours',
                      'No upfront payment until you approve',
                    ].map(item => (
                      <li key={item} className="flex items-center gap-2.5 text-sm font-body text-gf-muted">
                        <Check className="w-4 h-4 text-gf-light shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

function Field({ label, value, onChange, placeholder, required, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; required?: boolean; type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-body font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid focus:border-transparent transition-shadow"
      />
    </div>
  )
}
