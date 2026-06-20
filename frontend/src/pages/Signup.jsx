import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

const ROLE_CARDS = [
  {
    id: 'customer',
    label: 'Customer',
    icon: '🛒',
    color: 'from-violet-600 to-purple-700',
    border: 'border-violet-500',
    bg: 'bg-violet-50',
    desc: 'View your farm services, reports, and progress',
  },
]

const EMPTY = {
  name: '', email: '', phone: '', password: '', confirm: '',
  farm_name: '', farm_location: '', skills: '', experience: '',
}

export default function Signup() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [step, setStep]   = useState(2) // skip role select, go straight to form
  const [role, setRole]   = useState(ROLE_CARDS[0])
  const [form, setForm]   = useState(EMPTY)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleRoleSelect = (r) => {
    setRole(r)
    setStep(2)
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        confirm_password: form.confirm,
        role: role.id,
        farm_name: form.farm_name || undefined,
        farm_location: form.farm_location || undefined,
        skills: form.skills || undefined,
        experience: form.experience || undefined,
      })
      await signIn(form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join('; '))
      } else {
        setError(detail || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f13] via-gf-dark to-[#1e5c3a] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gf-light/10 rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-gf-mid/10 rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gf-pale rounded-full flex items-center justify-center shadow-lg shadow-black/20">
              <span className="text-gf-dark font-heading font-bold text-sm">GF</span>
            </div>
            <div className="text-left">
              <p className="text-white font-heading font-bold text-base leading-tight group-hover:text-gf-pale transition-colors">GreenField Farm Care</p>
              <p className="text-white/40 text-[10px] tracking-widest font-body">FARM CARE</p>
            </div>
          </Link>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-bold transition-all
                ${step >= s ? 'bg-gf-pale text-gf-dark' : 'bg-white/10 text-white/40'}`}>
                {s}
              </div>
              {s < 2 && <div className={`w-8 h-0.5 rounded ${step > s ? 'bg-gf-pale' : 'bg-white/20'}`} />}
            </div>
          ))}
          <span className="text-white/50 text-xs font-body ml-2">
            {step === 1 ? 'Choose role' : 'Fill details'}
          </span>
        </div>

        {/* ── Step 1: Role Selection ── */}
        {step === 1 && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-heading font-bold text-white mb-1">Create your account</h2>
              <p className="text-white/60 font-body text-sm">Choose your role to get started</p>
            </div>
            <div className="space-y-3">
              {ROLE_CARDS.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-white/10 bg-white/5 backdrop-blur-sm
                    hover:border-white/30 hover:bg-white/10 transition-all text-left group`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                    {r.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-heading font-semibold text-base">{r.label}</p>
                    <p className="text-white/50 font-body text-xs mt-0.5">{r.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-center mt-6 text-sm font-body text-white/50">
              Already have an account?{' '}
              <Link to="/login" className="text-gf-pale font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* ── Step 2: Registration Form ── */}
        {step === 2 && role && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => { setStep(1); setError('') }} className="text-white/60 hover:text-white transition-colors text-sm font-body flex items-center gap-1">
                ← Back
              </button>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg">{role.icon}</span>
                <div>
                  <p className="text-white font-heading font-semibold text-sm">{role.label} Registration</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-6">
              {error && (
                <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg font-body">
                  <span className="mt-0.5 flex-shrink-0">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Common fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Full Name *</label>
                    <input required value={form.name} onChange={set('name')}
                      placeholder="Enter your full name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Email Address *</label>
                    <input required type="email" value={form.email} onChange={set('email')}
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Phone Number</label>
                    <input value={form.phone} onChange={set('phone')}
                      placeholder="+91 98765 00000"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
                  </div>

                  {/* Farm Owner specific */}
                  {role.id === 'farm_owner' && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Farm Name *</label>
                        <input required value={form.farm_name} onChange={set('farm_name')}
                          placeholder="e.g. Sri Rama Farms"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Farm Location *</label>
                        <input required value={form.farm_location} onChange={set('farm_location')}
                          placeholder="e.g. Karnataka, India"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
                      </div>
                    </>
                  )}

                  {/* Farm Worker specific */}
                  {role.id === 'farm_worker' && (
                    <>
                      <div className="col-span-2">
                        <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Skills</label>
                        <input value={form.skills} onChange={set('skills')}
                          placeholder="e.g. Irrigation, Pest Control, Harvesting"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Experience</label>
                        <input value={form.experience} onChange={set('experience')}
                          placeholder="e.g. 3 years in paddy farming"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
                      </div>
                    </>
                  )}

                  {/* Password */}
                  <div className="col-span-2 border-t border-gray-100 pt-3">
                    <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Password *</label>
                    <div className="relative">
                      <input required type={showPass ? 'text' : 'password'} minLength={6}
                        value={form.password} onChange={set('password')}
                        placeholder="Min 6 characters"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                        {showPass ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Confirm Password *</label>
                    <input required type="password" value={form.confirm} onChange={set('confirm')}
                      placeholder="Re-enter your password"
                      className={`w-full border rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid
                        ${form.confirm && form.confirm !== form.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {form.confirm && form.confirm !== form.password && (
                      <p className="text-red-500 text-xs mt-1 font-body">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || (form.confirm !== form.password && form.confirm.length > 0)}
                  className="w-full bg-gf-dark text-white font-heading font-semibold py-3 rounded-xl hover:bg-gf-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-md shadow-gf-dark/20 mt-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : (
                    `Create ${role.label} Account`
                  )}
                </button>
              </form>
            </div>

            <p className="text-center mt-5 text-sm font-body text-white/50">
              Already have an account?{' '}
              <Link to="/login" className="text-gf-pale font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        <p className="text-center mt-4">
          <Link to="/" className="text-xs text-white/30 hover:text-white/60 font-body hover:underline">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}
