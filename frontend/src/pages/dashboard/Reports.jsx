import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getFarms } from '../../api/farms'
import { getFarmReports, createReport, uploadPhoto } from '../../api/reports'
import Badge from '../../components/dashboard/Badge'
import Pagination from '../../components/dashboard/Pagination'

export default function Reports() {
  const { user } = useAuth()
  const isFieldOrAdmin = user.role !== 'customer'
  const [farms, setFarms] = useState([])
  const [selectedFarm, setSelectedFarm] = useState('')
  const [reports, setReports] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    getFarms(1, 100).then(r => {
      const list = r.data || []
      setFarms(list)
      if (list.length > 0) setSelectedFarm(list[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedFarm) return
    setLoading(true)
    getFarmReports(selectedFarm, page).then(r => {
      setReports(r.data || [])
      setTotal(r.total || 0)
      setPages(r.pages || 1)
    }).finally(() => setLoading(false))
  }, [selectedFarm, page])

  const reload = () => {
    if (!selectedFarm) return
    setLoading(true)
    getFarmReports(selectedFarm, page).then(r => {
      setReports(r.data || [])
      setTotal(r.total || 0)
      setPages(r.pages || 1)
    }).finally(() => setLoading(false))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gf-dark">Field Reports</h1>
          <p className="text-gray-500 text-sm font-body">{total} reports</p>
        </div>
        {isFieldOrAdmin && selectedFarm && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-light transition-colors"
          >
            + Submit Report
          </button>
        )}
      </div>

      {/* Farm selector */}
      {farms.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {farms.map(f => (
            <button
              key={f.id}
              onClick={() => { setSelectedFarm(f.id); setPage(1) }}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors ${
                selectedFarm === f.id
                  ? 'bg-gf-mid text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gf-mid'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 font-body">Loading…</div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-body">No reports for this farm yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map(report => (
              <div key={report.id} className="px-5 py-4">
                <div
                  className="flex items-start justify-between cursor-pointer gap-4"
                  onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gf-pale rounded-xl flex items-center justify-center text-lg shrink-0">📋</div>
                    <div>
                      <p className="font-body font-semibold text-gf-dark text-sm">{report.visit_date}</p>
                      <p className="text-xs text-gray-400 font-body">
                        {report.arrival_time && `Arrival: ${report.arrival_time}`}
                        {report.arrival_time && report.departure_time && ' · '}
                        {report.departure_time && `Departure: ${report.departure_time}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge value={report.status} />
                    {report.next_visit_needed && (
                      <span className="text-xs text-amber-600 font-body font-semibold bg-amber-50 px-2 py-0.5 rounded-full">Next visit needed</span>
                    )}
                    <span className="text-gray-400 text-sm">{expandedId === report.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expandedId === report.id && (
                  <div className="mt-4 space-y-3 pl-13">
                    {report.work_done && (
                      <div>
                        <p className="text-xs font-body font-medium text-gray-500 uppercase tracking-wide mb-1">Work Done</p>
                        <p className="text-sm font-body text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{report.work_done}</p>
                      </div>
                    )}
                    {report.issues_found && (
                      <div>
                        <p className="text-xs font-body font-medium text-gray-500 uppercase tracking-wide mb-1">Issues Found</p>
                        <p className="text-sm font-body text-gray-700 bg-amber-50 rounded-lg px-3 py-2">{report.issues_found}</p>
                      </div>
                    )}
                    {report.photos?.length > 0 && (
                      <div>
                        <p className="text-xs font-body font-medium text-gray-500 uppercase tracking-wide mb-2">Photos ({report.photos.length})</p>
                        <div className="flex gap-2 flex-wrap">
                          {report.photos.map(p => (
                            <a key={p.id} href={p.s3_url} target="_blank" rel="noopener noreferrer">
                              <img src={p.s3_url} alt={p.caption || 'Report photo'} className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity" onError={e => { e.target.style.display = 'none' }} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {isFieldOrAdmin && (
                      <PhotoUpload reportId={report.id} onUploaded={reload} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="px-5 py-3 border-t border-gray-100">
          <Pagination page={page} pages={pages} onPage={setPage} />
        </div>
      </div>

      {showCreate && selectedFarm && (
        <CreateReportModal
          farmId={selectedFarm}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); reload() }}
        />
      )}
    </div>
  )
}

function PhotoUpload({ reportId, onUploaded }) {
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      await uploadPhoto(reportId, file, caption)
      setDone(true)
      setFile(null)
      setCaption('')
      onUploaded()
    } catch {}
    setUploading(false)
  }

  if (done) return <p className="text-xs text-green-600 font-body">✓ Photo uploaded</p>

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="text-xs font-body text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gf-pale file:text-gf-dark file:font-semibold hover:file:bg-gf-light hover:file:text-white file:transition-colors" />
      <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (optional)" className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-body focus:outline-none focus:ring-1 focus:ring-gf-mid w-36" />
      {file && (
        <button onClick={handleUpload} disabled={uploading} className="bg-gf-mid text-white text-xs font-heading font-semibold px-3 py-1 rounded-lg hover:bg-gf-light disabled:opacity-60 transition-colors">
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      )}
    </div>
  )
}

function CreateReportModal({ farmId, onClose, onCreated }) {
  const [form, setForm] = useState({ visit_date: '', arrival_time: '', departure_time: '', work_done: '', issues_found: '', next_visit_needed: false })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createReport({
        farm_id: farmId,
        visit_date: form.visit_date,
        arrival_time: form.arrival_time || null,
        departure_time: form.departure_time || null,
        work_done: form.work_done || null,
        issues_found: form.issues_found || null,
        next_visit_needed: form.next_visit_needed,
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit report')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-heading font-bold text-gf-dark">Submit Field Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Visit Date *</label>
            <input required type="date" value={form.visit_date} onChange={e => set('visit_date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Arrival Time</label>
              <input type="time" value={form.arrival_time} onChange={e => set('arrival_time', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Departure Time</label>
              <input type="time" value={form.departure_time} onChange={e => set('departure_time', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Work Done</label>
            <textarea value={form.work_done} onChange={e => set('work_done', e.target.value)} rows={3} placeholder="Describe what was done…" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid resize-none" />
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Issues Found</label>
            <textarea value={form.issues_found} onChange={e => set('issues_found', e.target.value)} rows={2} placeholder="Any issues observed…" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.next_visit_needed} onChange={e => set('next_visit_needed', e.target.checked)} className="w-4 h-4 rounded accent-gf-mid" />
            <span className="text-sm font-body text-gray-700">Next visit needed</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-light disabled:opacity-60">
              {saving ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
