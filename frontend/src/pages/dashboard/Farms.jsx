import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getFarms, createFarm } from '../../api/farms'
import Badge from '../../components/dashboard/Badge'
import Pagination from '../../components/dashboard/Pagination'

const PLANS = ['none', 'basic', 'standard', 'premium']
const DISTRICTS = ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Other']

export default function Farms() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'
  const [farms, setFarms] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = farms.filter(f => {
    const q = search.toLowerCase()
    return !q || f.name?.toLowerCase().includes(q) ||
      f.village?.toLowerCase().includes(q) ||
      f.mandal?.toLowerCase().includes(q) ||
      f.district?.toLowerCase().includes(q)
  })

  const load = (p = 1) => {
    setLoading(true)
    getFarms(p, 15).then(res => {
      setFarms(res.data || [])
      setTotal(res.total || 0)
      setPages(res.pages || 1)
      setPage(res.page || p)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gf-dark">Farms</h1>
          <p className="text-gray-500 text-sm font-body">{total} total farms</p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or location…"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid w-56"
          />
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-light transition-colors whitespace-nowrap"
            >
              + Add Farm
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 font-body">Loading…</div>
        ) : farms.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-body">No farms found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Farm Name</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Location</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Size</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Plan</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="py-10 text-center text-gray-400 text-sm font-body">No farms match your search.</td></tr>
                  ) : filtered.map(farm => (
                    <tr key={farm.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-body font-medium text-gf-dark">{farm.name}</p>
                        <p className="text-xs text-gray-400">{farm.village || ''}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-body hidden sm:table-cell">
                        {[farm.mandal, farm.district].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-body hidden md:table-cell">
                        {farm.size_acres ? `${farm.size_acres} ac` : '—'}
                      </td>
                      <td className="px-5 py-3"><Badge value={farm.status} /></td>
                      <td className="px-5 py-3 hidden md:table-cell"><Badge value={farm.subscription_plan} /></td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/dashboard/farms/${farm.id}`}
                          className="text-xs text-gf-mid font-body hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-gray-100">
              <Pagination page={page} pages={pages} onPage={load} />
            </div>
          </>
        )}
      </div>

      {showModal && (
        <AddFarmModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load() }}
        />
      )}
    </div>
  )
}

function AddFarmModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    customer_id: '', name: '', village: '', mandal: '',
    district: '', size_acres: '', subscription_plan: 'none',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createFarm({
        ...form,
        size_acres: form.size_acres ? parseFloat(form.size_acres) : null,
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create farm')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-gf-dark">Add New Farm</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <Field label="Customer User ID *" value={form.customer_id} onChange={v => set('customer_id', v)} placeholder="UUID of the customer" required />
          <Field label="Farm Name *" value={form.name} onChange={v => set('name', v)} placeholder="e.g. Venkat Farm A" required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Village" value={form.village} onChange={v => set('village', v)} placeholder="Village" />
            <Field label="Mandal" value={form.mandal} onChange={v => set('mandal', v)} placeholder="Mandal" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">District</label>
              <select value={form.district} onChange={e => set('district', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <Field label="Size (acres)" value={form.size_acres} onChange={v => set('size_acres', v)} placeholder="e.g. 12.5" type="number" />
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Subscription Plan</label>
            <select value={form.subscription_plan} onChange={e => set('subscription_plan', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
              {PLANS.map(p => <option key={p} className="capitalize">{p}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-light disabled:opacity-60 transition-colors">
              {saving ? 'Creating…' : 'Create Farm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, required, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-body font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid"
      />
    </div>
  )
}
