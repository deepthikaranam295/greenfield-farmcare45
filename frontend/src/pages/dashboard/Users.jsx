import { useState, useEffect, useCallback } from 'react'
import { getUsers, createUser, deactivateUser, activateUser } from '../../api/users'

const ROLES = ['field_team', 'admin']

const ROLE_BADGE = {
  admin:      'bg-purple-100 text-purple-700',
  field_team: 'bg-blue-100 text-blue-700',
  customer:   'bg-green-100 text-green-700',
}

const EMPTY_FORM = { name: '', email: '', phone: '', role: 'field_team' }

export default function Users() {
  const [users, setUsers]     = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [activationLink, setActivationLink] = useState('')
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUsers(1, 50)
      setUsers(res.data)
      setTotal(res.total)
    } catch {
      // silently fail — layout error boundary will catch critical errors
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async e => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)
    try {
      const result = await createUser({ name: form.name, email: form.email, phone: form.phone, role: form.role })
      setActivationLink(result.activation_link || '')
      setSuccessMsg(`User "${form.name}" created. Share the activation link below so they can set their password.`)
      setCopied(false)
      setShowModal(false)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create user.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(activationLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggle = async (user) => {
    try {
      const updated = user.is_active
        ? await deactivateUser(user.id)
        : await activateUser(user.id)
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
    } catch (err) {
      alert(err.response?.data?.detail || 'Action failed.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-heading font-bold text-gf-dark">Users</h1>
          <p className="text-sm text-gray-500 font-body mt-0.5">{total} total accounts</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setFormError('') }}
          className="bg-gf-mid text-white text-sm font-heading font-semibold px-4 py-2 rounded-lg hover:bg-gf-light transition-colors"
        >
          + Add User
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-4 font-body">
          <p className="text-green-700 text-sm font-semibold mb-3">✅ {successMsg}</p>
          {activationLink && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Activation link (valid for 72 hours):</p>
              <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2 flex-wrap">
                <code className="text-xs font-mono text-gf-dark flex-1 break-all">{activationLink}</code>
                <button
                  onClick={copyLink}
                  className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gf-mid text-white hover:bg-gf-dark'}`}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <p className="text-xs text-amber-600">Share this link with the user. They will set their own password when they open it.</p>
            </div>
          )}
          <button onClick={() => { setSuccessMsg(''); setActivationLink('') }} className="mt-3 text-xs text-green-600 hover:underline block">Dismiss</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 font-body text-sm">Loading…</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-body text-sm">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-heading font-semibold text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-heading font-semibold text-gray-600 hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3 font-heading font-semibold text-gray-600 hidden md:table-cell">Phone</th>
                <th className="text-left px-5 py-3 font-heading font-semibold text-gray-600">Role</th>
                <th className="text-left px-5 py-3 font-heading font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-body font-medium text-gf-dark">{u.name}</td>
                  <td className="px-5 py-3 font-body text-gray-500 hidden sm:table-cell">{u.email}</td>
                  <td className="px-5 py-3 font-body text-gray-500 hidden md:table-cell">{u.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-xs font-heading font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-xs font-heading font-semibold px-2.5 py-1 rounded-full ${
                      !u.is_active && !u.password_set
                        ? 'bg-amber-100 text-amber-700'
                        : u.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                    }`}>
                      {!u.is_active && !u.password_set ? 'Pending Activation' : u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleToggle(u)}
                      className={`text-xs font-body font-medium px-3 py-1.5 rounded-lg border transition-colors
                        ${u.is_active
                          ? 'border-red-200 text-red-500 hover:bg-red-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-gf-dark text-lg">Add New User</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >×</button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg font-body">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Full Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ramu Kumar"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="ramu@greenfield.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid"
                  />
                </div>

                <div>
                  <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="9876500000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid"
                  />
                </div>

                <div>
                  <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Role *</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <div className="text-xs text-gf-dark font-body bg-gf-pale/60 border border-gf-pale rounded-lg px-3 py-2 space-y-1">
                    <p className="font-semibold">🔗 Activation link will be generated</p>
                    <p className="text-gray-600">The user will receive an activation link to set their own password. No password is required from you.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-600 text-sm font-heading font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gf-mid text-white text-sm font-heading font-semibold py-2.5 rounded-lg hover:bg-gf-light transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
