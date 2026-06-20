import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [token, setToken]         = useState(params.get('token') || '')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    if (!token.trim())        { setError('Reset token is required.'); return }

    setLoading(true)
    try {
      await resetPassword(token.trim(), password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired token. Please request a new reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f13] via-gf-dark to-[#1e5c3a] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-gf-light/10 rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -left-16 w-96 h-96 bg-gf-mid/10 rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gf-pale rounded-full flex items-center justify-center shadow-lg">
              <span className="text-gf-dark font-heading font-bold text-sm">GF</span>
            </div>
            <span className="text-white font-heading font-bold text-base group-hover:text-gf-pale transition-colors">
              GreenField Farm Care
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-xl font-heading font-bold text-gf-dark mb-2">Password Reset!</h2>
              <p className="text-gray-500 font-body text-sm mb-4">
                Your password has been updated. Redirecting to login…
              </p>
              <Link
                to="/login"
                className="inline-block bg-gf-dark text-white font-heading font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-gf-mid transition-colors"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gf-pale rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔑</span>
                </div>
                <h2 className="text-xl font-heading font-bold text-gf-dark">Set New Password</h2>
                <p className="text-gray-500 font-body text-sm mt-1">Enter your reset token and choose a new password.</p>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg font-body">
                  <span className="mt-0.5 flex-shrink-0">⚠</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-body font-medium text-gray-700 mb-1.5">Reset Token *</label>
                  <textarea
                    required
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    rows={2}
                    placeholder="Paste your reset token here"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-gf-mid resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-body font-medium text-gray-700 mb-1.5">New Password *</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-body font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid
                      ${confirm && confirm !== password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gf-dark text-white font-heading font-semibold py-3 rounded-xl hover:bg-gf-mid transition-colors disabled:opacity-60 text-sm shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting…
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm text-gf-mid font-body font-semibold hover:underline">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
