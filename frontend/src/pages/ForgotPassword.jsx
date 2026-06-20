import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/auth'

export default function ForgotPassword() {
  const [email, setEmail]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [devToken, setDevToken]   = useState('')
  const [error, setError]         = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await forgotPassword(email)
      setSubmitted(true)
      if (res.dev_reset_token) setDevToken(res.dev_reset_token)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
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
          {!submitted ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gf-pale rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔐</span>
                </div>
                <h2 className="text-xl font-heading font-bold text-gf-dark">Forgot Password?</h2>
                <p className="text-gray-500 font-body text-sm mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg font-body">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-body font-medium text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid"
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
                      Sending…
                    </span>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-xl font-heading font-bold text-gf-dark mb-2">Check your email</h2>
              <p className="text-gray-500 font-body text-sm mb-4">
                If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
              </p>

              {/* Dev-mode token helper */}
              {devToken && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                  <p className="text-amber-700 text-xs font-heading font-semibold mb-2">
                    🛠 Development Mode — Reset Token
                  </p>
                  <p className="text-amber-600 text-xs font-body mb-2">
                    In production this goes to email. Use this token to reset your password:
                  </p>
                  <div className="bg-white border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <code className="text-xs text-gray-700 break-all flex-1 font-mono">{devToken}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(devToken)}
                      className="text-amber-600 hover:text-amber-800 text-xs font-body flex-shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                  <Link
                    to={`/reset-password?token=${devToken}`}
                    className="mt-3 inline-block w-full text-center bg-gf-dark text-white text-xs font-heading font-semibold px-4 py-2 rounded-lg hover:bg-gf-mid transition-colors"
                  >
                    Go to Reset Password →
                  </Link>
                </div>
              )}
            </div>
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
