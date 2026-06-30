import { useState, useRef } from 'react'
import Layout from '../components/Layout'
import { submitLead } from '../api/leads'

const SERVICES = ['Fencing', 'Drip Irrigation', 'Field Mapping', 'Plantation', 'Camera Installation']
const STATES   = ['Andhra Pradesh', 'Telangana', 'Karnataka']

const EMPTY = {
  name: '', email: '', phone: '',
  services: [], serviceOther: '',
  state: '', stateOther: '',
  district: '', mandal: '', village: '',
  sizeAcres: '', budgetRange: '',
  farmCoordinates: '', otherDetails: '',
}

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-heading font-semibold text-gf-dark mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:border-gf-mid focus:ring-1 focus:ring-gf-mid transition-colors bg-white"

export default function Contact() {
  const [form, setForm]           = useState(EMPTY)
  const [files, setFiles]         = useState([])
  const [fileErr, setFileErr]     = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [formErr, setFormErr]     = useState('')
  const fileRef = useRef()

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const toggleService = svc =>
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(svc)
        ? prev.services.filter(s => s !== svc)
        : [...prev.services, svc],
    }))

  const handleFiles = e => {
    const picked = Array.from(e.target.files)
    if (picked.length + files.length > 5) { setFileErr('Maximum 5 files allowed.'); return }
    const tooBig = picked.find(f => f.size > 10 * 1024 * 1024)
    if (tooBig) { setFileErr(`${tooBig.name} exceeds 10 MB.`); return }
    setFileErr('')
    setFiles(prev => [...prev, ...picked].slice(0, 5))
    e.target.value = ''
  }

  const removeFile = i => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const effectiveState    = form.state === 'Other' ? form.stateOther    : form.state
  const effectiveServices = [
    ...form.services,
    ...(form.serviceOther.trim() ? [`Other: ${form.serviceOther.trim()}`] : []),
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    setFormErr('')

    if (effectiveServices.length === 0) { setFormErr('Please select at least one service.'); return }
    if (!effectiveState)                { setFormErr('Please select your farm state.'); return }

    setLoading(true)
    try {
      await submitLead({ ...form, state: effectiveState, services: effectiveServices })
    } catch (_) {
      // Formspree fallback
      try {
        const fd = new FormData()
        fd.append('name',     form.name)
        fd.append('email',    form.email)
        fd.append('phone',    form.phone)
        fd.append('services', effectiveServices.join(', '))
        fd.append('state',    effectiveState)
        fd.append('district', form.district)
        fd.append('mandal',   form.mandal)
        fd.append('village',  form.village)
        fd.append('sizeAcres',   form.sizeAcres)
        fd.append('budgetRange', form.budgetRange)
        fd.append('farmCoordinates', form.farmCoordinates)
        fd.append('otherDetails',    form.otherDetails)
        files.forEach(f => fd.append('attachment', f))
        await fetch('https://formspree.io/f/xpwzgvkq', { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      } catch (_2) { /* silent */ }
    } finally {
      setSubmitted(true)
      setLoading(false)
    }
  }

  /* ── Success screen ── */
  if (submitted) {
    return (
      <Layout>
        <section className="min-h-[70vh] flex items-center justify-center bg-gf-offwhite px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="font-heading font-bold text-gf-dark text-3xl mb-4">Enquiry Received!</h2>
            <p className="text-gray-600 mb-2 leading-relaxed">
              Thank you, <strong>{form.name}</strong>. We have received your service enquiry.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Our team will call you on <strong>{form.phone}</strong> within 24 hours to discuss next steps.
            </p>
            {files.length > 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-4 py-2 mb-6">
                Please send your farm documents via WhatsApp for faster processing.
              </p>
            )}
            <a
              href={`https://wa.me/919945100567?text=Hi%2C%20I%20just%20submitted%20a%20service%20enquiry%20on%20your%20website.%20My%20name%20is%20${encodeURIComponent(form.name)}.`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-heading font-semibold text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.5-1.74A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.18 0-4.23-.6-5.99-1.64l-.43-.26-4.45 1.03 1.06-4.33-.28-.45A11.45 11.45 0 0 1 4.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zM22.5 19.1c-.34-.17-2-.98-2.31-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.31-.2.22-.39.25-.73.08-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.39.51-.59.17-.2.22-.34.34-.56.11-.22.06-.42-.03-.59-.08-.17-.77-1.85-1.05-2.53-.28-.67-.56-.58-.77-.59H10.9c-.22 0-.59.08-.9.42-.31.34-1.17 1.14-1.17 2.79s1.2 3.23 1.37 3.46c.17.22 2.36 3.6 5.72 5.05.8.34 1.42.55 1.91.7.8.25 1.53.22 2.11.13.64-.1 2-.82 2.28-1.61.28-.79.28-1.47.2-1.61-.08-.14-.3-.22-.64-.39z"/></svg>
              Send Documents on WhatsApp
            </a>
          </div>
        </section>
      </Layout>
    )
  }

  /* ── Form ── */
  return (
    <Layout>
      {/* Header */}
      <section className="bg-gf-dark text-white py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-3">
            GreenField Service Enquiry
          </h1>
          <p className="text-white/70 text-base max-w-xl mx-auto">
            Please share the required details about your farm, the services required and budget for providing the services.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gf-offwhite">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            <p className="text-xs text-gray-400 font-body mb-6">
              <span className="text-red-500">*</span> Indicates required question
            </p>

            <form onSubmit={handleSubmit} className="space-y-7">

              {/* ── Personal details ── */}
              <Field label="Name" required>
                <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Your full name" className={inputCls} />
              </Field>

              <Field label="Email address" required>
                <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="example@gmail.com" className={inputCls} />
              </Field>

              <Field label="Phone number" required>
                <input type="tel" required value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+91 99999 99999" className={inputCls} />
              </Field>

              {/* ── Services ── */}
              <Field label="Service(s) you are looking for (select all you need)" required>
                <div className="space-y-2 mt-1">
                  {SERVICES.map(svc => (
                    <label key={svc} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.services.includes(svc)}
                        onChange={() => toggleService(svc)}
                        className="w-4 h-4 rounded border-gray-300 text-gf-mid focus:ring-gf-mid"
                      />
                      <span className="text-sm font-body text-gf-dark group-hover:text-gf-mid transition-colors">{svc}</span>
                    </label>
                  ))}
                  {/* Other option */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.serviceOther !== ''}
                      onChange={e => { if (!e.target.checked) set('serviceOther', '') }}
                      className="w-4 h-4 rounded border-gray-300 text-gf-mid focus:ring-gf-mid mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-body text-gf-dark">Other:</span>
                      <input
                        type="text"
                        value={form.serviceOther}
                        onChange={e => set('serviceOther', e.target.value)}
                        placeholder="Please specify"
                        className="mt-1 w-full border-b border-gray-300 px-0 py-1 text-sm font-body focus:outline-none focus:border-gf-mid bg-transparent"
                      />
                    </div>
                  </label>
                </div>
                {formErr && effectiveServices.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">This is a required question</p>
                )}
              </Field>

              {/* ── Farm location: State ── */}
              <Field label="Your Farm Location: State" required>
                <div className="space-y-2 mt-1">
                  {STATES.map(st => (
                    <label key={st} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="state"
                        value={st}
                        checked={form.state === st}
                        onChange={() => set('state', st)}
                        className="w-4 h-4 border-gray-300 text-gf-mid focus:ring-gf-mid"
                      />
                      <span className="text-sm font-body text-gf-dark group-hover:text-gf-mid transition-colors">{st}</span>
                    </label>
                  ))}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="state"
                      value="Other"
                      checked={form.state === 'Other'}
                      onChange={() => set('state', 'Other')}
                      className="w-4 h-4 border-gray-300 text-gf-mid focus:ring-gf-mid mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-body text-gf-dark">Other:</span>
                      {form.state === 'Other' && (
                        <input
                          type="text"
                          value={form.stateOther}
                          onChange={e => set('stateOther', e.target.value)}
                          placeholder="Enter your state"
                          required
                          className="mt-1 w-full border-b border-gray-300 px-0 py-1 text-sm font-body focus:outline-none focus:border-gf-mid bg-transparent"
                        />
                      )}
                    </div>
                  </label>
                </div>
              </Field>

              {/* ── Location details ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="District" required>
                  <input type="text" required value={form.district} onChange={e => set('district', e.target.value)}
                    placeholder="e.g. Anantapur" className={inputCls} />
                </Field>
                <Field label="Mandal" required>
                  <input type="text" required value={form.mandal} onChange={e => set('mandal', e.target.value)}
                    placeholder="e.g. Dharmavaram" className={inputCls} />
                </Field>
                <Field label="Village" required>
                  <input type="text" required value={form.village} onChange={e => set('village', e.target.value)}
                    placeholder="e.g. Nallamada" className={inputCls} />
                </Field>
              </div>

              <Field label="Size in Acres" required>
                <input type="text" required value={form.sizeAcres} onChange={e => set('sizeAcres', e.target.value)}
                  placeholder="e.g. 5 or 10-15" className={inputCls} />
              </Field>

              <Field label="Budget range for the required services" required>
                <input type="text" required value={form.budgetRange} onChange={e => set('budgetRange', e.target.value)}
                  placeholder="e.g. ₹2–5 lakhs" className={inputCls} />
              </Field>

              <Field label="Farm Location coordinates" hint="Optional — helps us plan the site visit better">
                <input type="text" value={form.farmCoordinates} onChange={e => set('farmCoordinates', e.target.value)}
                  placeholder="e.g. 14.6821, 77.5943" className={inputCls} />
              </Field>

              <Field label="Enter any other details you want to provide">
                <textarea
                  value={form.otherDetails}
                  onChange={e => set('otherDetails', e.target.value)}
                  rows={4}
                  placeholder="Any additional information about your farm or requirements..."
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {/* ── File upload ── */}
              <Field
                label="Upload your farm related documents"
                hint="Farm images, documents etc. Maximum 5 files, up to 10 MB each. PDF, JPEG, PNG accepted."
              >
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gf-mid transition-colors"
                  onClick={() => fileRef.current?.click()}
                >
                  <p className="text-2xl mb-2">📎</p>
                  <p className="text-sm font-heading font-semibold text-gf-mid">Click to upload files</p>
                  <p className="text-xs text-gray-400 mt-1">Up to 5 files · 10 MB each · PDF, JPEG, PNG</p>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFiles}
                  />
                </div>

                {fileErr && <p className="text-xs text-red-500 mt-1">{fileErr}</p>}

                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm font-body">
                        <span className="truncate text-gray-700 mr-2">📄 {f.name}</span>
                        <span className="text-gray-400 text-xs shrink-0 mr-2">{(f.size / 1024).toFixed(0)} KB</span>
                        <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 shrink-0 text-lg leading-none">×</button>
                      </li>
                    ))}
                  </ul>
                )}
              </Field>

              {/* Error */}
              {formErr && (
                <p className="text-sm text-red-500 font-body bg-red-50 rounded-lg px-4 py-2">{formErr}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gf-mid text-white font-heading font-bold py-4 rounded-xl hover:bg-gf-dark transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed text-base"
              >
                {loading ? 'Submitting…' : 'Submit Enquiry'}
              </button>

              <p className="text-center text-xs text-gray-400 font-body">
                We will contact you within 24 hours · Free site visit · No obligation
              </p>

            </form>
          </div>

          {/* Quick contact below form */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="tel:+919945100567"
              className="flex items-center justify-center gap-2 bg-gf-dark text-white font-heading font-semibold px-5 py-3.5 rounded-xl hover:bg-gf-mid transition-colors">
              📞 Call Us Now
            </a>
            <a href="https://wa.me/919945100567?text=Hi%2C%20I%27m%20interested%20in%20GreenField%20Farm%20Care%20services"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 font-heading font-semibold px-5 py-3.5 rounded-xl text-white transition-colors"
              style={{ backgroundColor: '#25D366' }}>
              <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.5-1.74A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.18 0-4.23-.6-5.99-1.64l-.43-.26-4.45 1.03 1.06-4.33-.28-.45A11.45 11.45 0 0 1 4.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zM22.5 19.1c-.34-.17-2-.98-2.31-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.31-.2.22-.39.25-.73.08-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.39.51-.59.17-.2.22-.34.34-.56.11-.22.06-.42-.03-.59-.08-.17-.77-1.85-1.05-2.53-.28-.67-.56-.58-.77-.59H10.9c-.22 0-.59.08-.9.42-.31.34-1.17 1.14-1.17 2.79s1.2 3.23 1.37 3.46c.17.22 2.36 3.6 5.72 5.05.8.34 1.42.55 1.91.7.8.25 1.53.22 2.11.13.64-.1 2-.82 2.28-1.61.28-.79.28-1.47.2-1.61-.08-.14-.3-.22-.64-.39z"/></svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  )
}
