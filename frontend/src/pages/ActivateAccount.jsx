import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import client from '../api/client'

export default function ActivateAccount() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [form, setForm] = useState({ new_password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (!token) setError('Invalid activation link. Please contact your administrator.')
  }, [token])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const getStrength = (pw) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
  const strength = getStrength(form.new_password)

  const submit = async e => {
    e.preventDefault()
    setError('')
    if (form.new_password !== form.confirm_password) {
      setError('Passwords do not match')
      return
    }
    if (form.new_password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await client.post('/api/auth/activate', {
        token,
        new_password: form.new_password,
        confirm_password: form.confirm_password,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Activation failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gf-dark via-gf-mid to-gf-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="font-heading font-bold text-white text-2xl">Activate Your Account</h1>
          <p className="text-white/70 text-sm font-body mt-1">Set a password to get started with GreenField Farm Care</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="font-heading font-bold text-gf-dark text-xl">Account Activated!</h2>
              <p className="text-gray-500 font-body text-sm">You can now log in with your new password. Redirecting…</p>
              <Link to="/login" className="block w-full bg-gf-mid text-white font-heading font-semibold py-3 rounded-xl text-sm text-center hover:bg-gf-dark transition-colors">
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-body px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {!token && !error && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm font-body px-4 py-3 rounded-xl">
                  No activation token found. Please use the full link from your administrator.
                </div>
              )}

              <div>
                <label className="block text-sm font-body font-semibold text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPass ? 'text' : 'password'}
                    value={form.new_password}
                    onChange={e => set('new_password', e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-body"
                  >
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                {form.new_password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs font-body text-gray-500">{strengthLabel[strength]}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-body font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <input
                  required
                  type={showPass ? 'text' : 'password'}
                  value={form.confirm_password}
                  onChange={e => set('confirm_password', e.target.value)}
                  placeholder="Repeat your password"
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid ${
                    form.confirm_password && form.confirm_password !== form.new_password
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {form.confirm_password && form.confirm_password !== form.new_password && (
                  <p className="text-xs text-red-500 font-body mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="bg-gf-pale/50 rounded-xl p-3 text-xs font-body text-gf-dark space-y-1">
                <p className="font-semibold mb-1">Password requirements:</p>
                <p className={form.new_password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>✓ At least 8 characters</p>
                <p className={/[A-Z]/.test(form.new_password) ? 'text-green-600' : 'text-gray-500'}>✓ One uppercase letter</p>
                <p className={/[0-9]/.test(form.new_password) ? 'text-green-600' : 'text-gray-500'}>✓ One number</p>
                <p className={/[^A-Za-z0-9]/.test(form.new_password) ? 'text-green-600' : 'text-gray-500'}>✓ One special character (@#!)</p>
              </div>

              <button
                type="submit"
                disabled={loading || !token || form.new_password !== form.confirm_password || form.new_password.length < 8}
                className="w-full bg-gf-mid text-white font-heading font-bold py-3 rounded-xl hover:bg-gf-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Activating…' : 'Activate Account'}
              </button>

              <p className="text-center text-sm font-body text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-gf-mid hover:underline font-semibold">Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
