import { useState, useEffect, useCallback } from 'react'
import { getLeads, getMyLeads, updateLead } from '../../api/leads'
import { getUsers } from '../../api/users'
import { useAuth } from '../../hooks/useAuth'

const STATUS_LABELS = {
  new:              { label: 'New',              bg: 'bg-blue-100',   text: 'text-blue-700' },
  contacted:        { label: 'Contacted',        bg: 'bg-amber-100',  text: 'text-amber-700' },
  visit_scheduled:  { label: 'Visit Scheduled',  bg: 'bg-purple-100', text: 'text-purple-700' },
  converted:        { label: 'Converted',        bg: 'bg-green-100',  text: 'text-green-700' },
  not_interested:   { label: 'Not Interested',   bg: 'bg-gray-100',   text: 'text-gray-500' },
}

const ALL_STATUSES = ['new', 'contacted', 'visit_scheduled', 'converted', 'not_interested']

function StatusBadge({ value }) {
  const s = STATUS_LABELS[value] || { label: value, bg: 'bg-gray-100', text: 'text-gray-500' }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  return `${String(d).padStart(2,'0')} ${months[m-1]} ${y}`
}

/* ── Assign + Status modal ── */
function LeadModal({ lead, fieldTeam, onClose, onSaved }) {
  const [status, setStatus] = useState(lead.status)
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to || '')
  const [notes, setNotes] = useState(lead.notes || '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const save = async () => {
    setSaving(true); setErr('')
    try {
      const payload = { status, notes }
      if (assignedTo) payload.assigned_to = assignedTo
      await updateLead(lead.id, payload)
      onSaved()
      onClose()
    } catch {
      setErr('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="font-heading font-bold text-gf-dark text-lg">{lead.name}</h2>
            <p className="text-sm text-gray-500 font-body mt-0.5">
              {lead.whatsapp} · {lead.city || '—'} · {lead.farm_size || '—'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none mt-0.5">×</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Services */}
          {lead.services && (
            <div>
              <p className="text-xs text-gray-400 font-heading uppercase tracking-wide mb-1">Services Requested</p>
              <p className="text-sm text-gf-dark font-body">{lead.services}</p>
            </div>
          )}

          {/* Farm location */}
          {lead.farm_location && (
            <div>
              <p className="text-xs text-gray-400 font-heading uppercase tracking-wide mb-1">Farm Location</p>
              <p className="text-sm text-gf-dark font-body">{lead.farm_location}</p>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-xs text-gray-400 font-heading uppercase tracking-wide mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:border-gf-mid"
            >
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]?.label || s}</option>
              ))}
            </select>
          </div>

          {/* Assign to field team */}
          <div>
            <label className="block text-xs text-gray-400 font-heading uppercase tracking-wide mb-1">Assign to Crew (to call)</label>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:border-gf-mid"
            >
              <option value="">— Unassigned —</option>
              {fieldTeam.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-gray-400 font-heading uppercase tracking-wide mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Call outcome, scheduled date, anything relevant..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:border-gf-mid resize-none"
            />
          </div>

          {/* WhatsApp quick-link */}
          <a
            href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(lead.name)}%2C%20this%20is%20GreenField%20Farm%20Care.%20We%20received%20your%20site%20visit%20request%20and%20would%20like%20to%20schedule%20a%20visit.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-heading font-semibold text-white px-4 py-2.5 rounded-lg w-full justify-center"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg viewBox="0 0 32 32" className="w-4 h-4 fill-white shrink-0">
              <path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.5-1.74A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.18 0-4.23-.6-5.99-1.64l-.43-.26-4.45 1.03 1.06-4.33-.28-.45A11.45 11.45 0 0 1 4.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zM22.5 19.1c-.34-.17-2-.98-2.31-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.31-.2.22-.39.25-.73.08-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.39.51-.59.17-.2.22-.34.34-.56.11-.22.06-.42-.03-.59-.08-.17-.77-1.85-1.05-2.53-.28-.67-.56-.58-.77-.59H10.9c-.22 0-.59.08-.9.42-.31.34-1.17 1.14-1.17 2.79s1.2 3.23 1.37 3.46c.17.22 2.36 3.6 5.72 5.05.8.34 1.42.55 1.91.7.8.25 1.53.22 2.11.13.64-.1 2-.82 2.28-1.61.28-.79.28-1.47.2-1.61-.08-.14-.3-.22-.64-.39z"/>
            </svg>
            WhatsApp {lead.name}
          </a>

          {err && <p className="text-sm text-red-500 font-body">{err}</p>}
        </div>

        <div className="px-6 pb-5 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-heading font-semibold text-gray-500 hover:bg-gray-100 transition-colors">Cancel</button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-heading font-semibold bg-gf-dark text-white hover:bg-gf-mid transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Leads page ── */
export default function Leads() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [leads, setLeads]         = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [fieldTeam, setFieldTeam] = useState([])
  const [selected, setSelected]   = useState(null)

  const load = useCallback(async (pg = page, st = filterStatus) => {
    setLoading(true)
    try {
      const res = isAdmin
        ? await getLeads(pg, 20, st)
        : await getMyLeads(pg, 20)
      setLeads(res.data || [])
      setTotal(res.total || 0)
    } catch {
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus, isAdmin])

  useEffect(() => { load() }, [load])

  // Load field team for assign dropdown (admin only)
  useEffect(() => {
    if (!isAdmin) return
    getUsers(1, 100, 'field_team').then(r => setFieldTeam((r.data || []).filter(u => u.is_active))).catch(() => {})
  }, [isAdmin])

  const changeStatus = (st) => {
    setFilterStatus(st); setPage(1); load(1, st)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-gf-dark text-2xl">
            {isAdmin ? 'Site Visit Requests' : 'My Assigned Leads'}
          </h1>
          <p className="text-gray-400 font-body text-sm mt-1">
            {isAdmin ? 'Leads from the contact form — assign to crew to call' : 'Leads assigned to you to contact'}
          </p>
        </div>
        <div className="bg-gf-pale/40 rounded-xl px-4 py-2 text-center">
          <p className="font-heading font-bold text-gf-dark text-xl">{total}</p>
          <p className="text-xs text-gray-400 font-body">Total</p>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {[{ value: '', label: 'All' }, ...ALL_STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s].label }))].map(opt => (
          <button
            key={opt.value}
            onClick={() => changeStatus(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-heading font-semibold transition-colors border ${
              filterStatus === opt.value
                ? 'bg-gf-dark text-white border-gf-dark'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gf-mid'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 font-body text-sm">Loading…</div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400 font-body text-sm">No leads found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">WhatsApp</th>
                  <th className="px-5 py-3.5 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">City</th>
                  <th className="px-5 py-3.5 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">Farm Size</th>
                  <th className="px-5 py-3.5 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">Services</th>
                  <th className="px-5 py-3.5 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3.5 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">Assigned To</th>
                  <th className="px-5 py-3.5 text-left text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-body font-semibold text-gf-dark">{lead.name}</td>
                    <td className="px-5 py-3.5">
                      <a
                        href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline font-body"
                      >
                        {lead.whatsapp}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 font-body">{lead.city || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600 font-body">{lead.farm_size || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600 font-body max-w-[180px] truncate" title={lead.services}>{lead.services || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500 font-body whitespace-nowrap">{fmtDate(lead.created_at)}</td>
                    <td className="px-5 py-3.5"><StatusBadge value={lead.status} /></td>
                    <td className="px-5 py-3.5 text-gray-600 font-body">
                      {lead.assigned_to_name
                        ? <span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-gf-pale text-gf-dark flex items-center justify-center text-[10px] font-bold shrink-0">{lead.assigned_to_name[0]}</span>{lead.assigned_to_name}</span>
                        : <span className="text-amber-500 text-xs font-heading">Unassigned</span>
                      }
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelected(lead)}
                        className="px-3 py-1.5 rounded-lg text-xs font-heading font-semibold bg-gf-dark text-white hover:bg-gf-mid transition-colors"
                      >
                        {isAdmin ? 'Manage' : 'Update'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => { setPage(p => p - 1); load(page - 1) }}
            className="px-4 py-2 rounded-lg text-sm font-heading font-semibold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            ← Prev
          </button>
          <span className="px-4 py-2 text-sm font-body text-gray-500">{page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => { setPage(p => p + 1); load(page + 1) }}
            className="px-4 py-2 rounded-lg text-sm font-heading font-semibold border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Manage modal */}
      {selected && (
        <LeadModal
          lead={selected}
          fieldTeam={fieldTeam}
          onClose={() => setSelected(null)}
          onSaved={() => load()}
        />
      )}
    </div>
  )
}
