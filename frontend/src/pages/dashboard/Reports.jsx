import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getFarms } from '../../api/farms'
import { getUsers } from '../../api/users'
import { getFarmReports, createReport, uploadPhoto } from '../../api/reports'
import { getTaskPerformance } from '../../api/users'
import Badge from '../../components/dashboard/Badge'
import Pagination from '../../components/dashboard/Pagination'

export default function Reports() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('performance')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading font-bold text-2xl text-gf-dark">Reports</h1>
        <p className="text-gray-500 text-sm font-body mt-0.5">Analytics, performance metrics, and field visit reports.</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          ['performance', 'Task Performance'],
          ['field', 'Field Reports'],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-heading font-semibold transition-colors
              ${activeTab === key ? 'bg-white text-gf-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'performance' && <PerformanceReport user={user} />}
      {activeTab === 'field'       && <FieldReports user={user} />}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TASK PERFORMANCE REPORT
═══════════════════════════════════════════════════════════════ */
function PerformanceReport({ user }) {
  const isAdmin = user.role === 'admin'
  const printRef = useRef(null)

  // Filter state
  const [customers, setCustomers]   = useState([])
  const [farms, setFarms]           = useState([])
  const [workers, setWorkers]       = useState([])
  const [customerFilter, setCustomerFilter] = useState('')
  const [farmFilter, setFarmFilter]         = useState('')
  const [assignedFilter, setAssignedFilter] = useState('')
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')

  // Report data
  const [perf, setPerf]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!isAdmin) return
    Promise.all([
      getUsers(1, 100, 'customer').catch(() => ({ data: [] })),
      getUsers(1, 100, 'field_team').catch(() => ({ data: [] })),
    ]).then(([c, w]) => {
      setCustomers((c.data || []).sort((a,b) => a.name.localeCompare(b.name)))
      setWorkers((w.data || []).sort((a,b) => a.name.localeCompare(b.name)))
    })
  }, [isAdmin])

  // Cascade: when customer changes, load their farms
  useEffect(() => {
    setFarmFilter('')
    if (!customerFilter) { setFarms([]); return }
    getFarms(1, 100, customerFilter)
      .then(r => setFarms(r.data || []))
      .catch(() => setFarms([]))
  }, [customerFilter])

  const loadReport = () => {
    setLoading(true)
    setError('')
    getTaskPerformance({
      customerId: customerFilter || null,
      farmId:     farmFilter     || null,
      assignedTo: assignedFilter || null,
      dateFrom:   dateFrom       || null,
      dateTo:     dateTo         || null,
    }).then(setPerf)
      .catch(() => { setPerf(null); setError('Failed to load report data.') })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadReport() }, [customerFilter, farmFilter, assignedFilter, dateFrom, dateTo])

  const exportCSV = () => {
    if (!perf) return
    const rows = [
      ['Metric', 'Value'],
      ['Total Tasks', perf.total],
      ['Pending', perf.pending],
      ['In Progress', perf.in_progress],
      ['Completed', perf.completed],
      ['Cancelled', perf.cancelled],
      ['Completed On Time', perf.completed_on_time],
      ['Completed Late', perf.completed_late],
      ['Overdue', perf.overdue],
      ['Due Soon (3 days)', perf.due_soon],
      ['Avg Delay (days)', perf.avg_delay_days],
      ['Completion Rate (%)', perf.completion_rate],
      [],
      ['Month', 'Completed Tasks'],
      ...(perf.monthly_trend || []).map(m => [m.month, m.count]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `task-performance-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => window.print()

  const sel = 'border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-body bg-white focus:outline-none focus:ring-2 focus:ring-gf-mid'

  return (
    <div className="space-y-5" ref={printRef}>
      {/* Filter bar */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-heading font-semibold text-gray-500 uppercase tracking-wide mr-1">Filters</span>

            <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} className={sel}>
              <option value="">All Customers</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select value={farmFilter} onChange={e => setFarmFilter(e.target.value)}
              disabled={!customerFilter && farms.length === 0} className={sel}>
              <option value="">{customerFilter ? (farms.length ? 'All Farms' : 'No farms') : 'All Farms'}</option>
              {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>

            <select value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)} className={sel}>
              <option value="">All Field Team</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>

            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-500 font-body">From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className={`${sel} w-32`} />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-500 font-body">To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className={`${sel} w-32`} />
            </div>

            {(customerFilter || farmFilter || assignedFilter || dateFrom || dateTo) && (
              <button onClick={() => {
                setCustomerFilter(''); setFarmFilter(''); setAssignedFilter('')
                setDateFrom(''); setDateTo('')
              }} className="text-xs text-red-500 hover:text-red-700 font-body border border-red-200 rounded-lg px-2 py-1.5">
                Clear
              </button>
            )}

            <div className="ml-auto flex gap-2">
              <button onClick={exportCSV} disabled={!perf}
                className="text-xs border border-gray-300 text-gray-600 font-body px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40">
                ⬇ Export CSV
              </button>
              <button onClick={handlePrint}
                className="text-xs border border-gray-300 text-gray-600 font-body px-3 py-1.5 rounded-lg hover:bg-gray-50">
                🖨 Print / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-body">Loading report…</div>
      ) : error ? (
        <div className="py-20 text-center text-red-400 font-body">{error}</div>
      ) : !perf ? (
        <div className="py-20 text-center text-gray-400 font-body">No data available.</div>
      ) : (
        <>
          {/* ── Metric Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard label="Total Tasks"   value={perf.total}           color="gray" />
            <MetricCard label="Completed"     value={perf.completed}       color="green" />
            <MetricCard label="Pending"       value={perf.pending}         color="amber" />
            <MetricCard label="In Progress"   value={perf.in_progress}     color="blue" />
            <MetricCard label="Overdue"       value={perf.overdue}         color="red" />
            <MetricCard label="Completion %"  value={`${perf.completion_rate}%`} color="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ── Status Distribution ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-heading font-semibold text-gf-dark mb-4">Task Status Distribution</h3>
              {perf.total === 0 ? (
                <p className="text-gray-400 text-sm font-body text-center py-4">No tasks yet.</p>
              ) : (
                <div className="space-y-3">
                  <StatusBar label="Completed"   count={perf.completed}   total={perf.total} color="bg-green-500" />
                  <StatusBar label="In Progress" count={perf.in_progress} total={perf.total} color="bg-blue-500" />
                  <StatusBar label="Pending"     count={perf.pending}     total={perf.total} color="bg-amber-400" />
                  <StatusBar label="Cancelled"   count={perf.cancelled}   total={perf.total} color="bg-gray-400" />
                  {perf.requested > 0 && (
                    <StatusBar label="Requested" count={perf.requested}   total={perf.total} color="bg-violet-500" />
                  )}
                </div>
              )}

              {perf.completed > 0 && (
                <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xl font-heading font-bold text-green-700">{perf.completed_on_time}</p>
                    <p className="text-xs text-gray-500 font-body">On Time</p>
                  </div>
                  <div>
                    <p className="text-xl font-heading font-bold text-red-600">{perf.completed_late}</p>
                    <p className="text-xs text-gray-500 font-body">Late</p>
                  </div>
                  <div>
                    <p className={`text-xl font-heading font-bold ${perf.avg_delay_days > 0 ? 'text-red-600' : 'text-green-700'}`}>
                      {perf.avg_delay_days > 0 ? `+${perf.avg_delay_days}d` : '0d'}
                    </p>
                    <p className="text-xs text-gray-500 font-body">Avg Delay</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Completion Rate gauge ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-heading font-semibold text-gf-dark mb-4">Overall Performance</h3>
              <div className="flex flex-col items-center justify-center py-4">
                <RateGauge rate={perf.completion_rate} />
                <p className="text-sm text-gray-500 font-body mt-3">of {perf.total} tasks completed</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                <div className={`rounded-xl p-3 text-center ${perf.overdue > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className={`text-2xl font-heading font-bold ${perf.overdue > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {perf.overdue}
                  </p>
                  <p className="text-xs font-body text-gray-500 mt-0.5">Overdue Tasks</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${perf.due_soon > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                  <p className={`text-2xl font-heading font-bold ${perf.due_soon > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                    {perf.due_soon}
                  </p>
                  <p className="text-xs font-body text-gray-500 mt-0.5">Due in 3 Days</p>
                </div>
              </div>

              {perf.overdue === 0 && perf.due_soon === 0 && perf.total > 0 && (
                <p className="text-center text-green-600 font-heading font-semibold text-sm mt-3">✅ All tasks on track!</p>
              )}
            </div>
          </div>

          {/* ── Monthly Completion Trend ── */}
          {perf.monthly_trend && perf.monthly_trend.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-heading font-semibold text-gf-dark mb-5">Monthly Completion Trend</h3>
              <MonthlyChart data={perf.monthly_trend} />
            </div>
          )}

          {/* ── Summary Table (for print) ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-heading font-semibold text-gf-dark">Summary Table</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Metric</th>
                  <th className="text-right px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  ['Total Tasks',           perf.total],
                  ['Completed',             perf.completed],
                  ['Completed On Time',     perf.completed_on_time],
                  ['Completed Late',        perf.completed_late],
                  ['Pending',               perf.pending],
                  ['In Progress',           perf.in_progress],
                  ['Cancelled',             perf.cancelled],
                  ['Overdue',               perf.overdue],
                  ['Due Soon (3 days)',     perf.due_soon],
                  ['Average Delay (days)',  perf.avg_delay_days],
                  ['Completion Rate',       `${perf.completion_rate}%`],
                ].map(([label, value]) => (
                  <tr key={label} className="hover:bg-gray-50/50">
                    <td className="px-5 py-2.5 font-body text-gray-700">{label}</td>
                    <td className="px-5 py-2.5 font-heading font-semibold text-gf-dark text-right">{value ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Chart components ── */

function MetricCard({ label, value, color }) {
  const styles = {
    green: 'bg-green-50 text-green-700 border-green-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    blue:  'bg-blue-50 text-blue-700 border-blue-100',
    red:   'bg-red-50 text-red-700 border-red-100',
    gray:  'bg-gray-50 text-gray-700 border-gray-200',
  }
  return (
    <div className={`border rounded-2xl px-4 py-4 text-center ${styles[color] || styles.gray}`}>
      <p className="text-2xl font-heading font-bold">{value ?? '—'}</p>
      <p className="text-xs font-body mt-1 text-gray-600">{label}</p>
    </div>
  )
}

function StatusBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-xs text-right font-body text-gray-600 shrink-0">{label}</div>
      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-20 text-xs font-body text-gray-600 shrink-0">
        {count} <span className="text-gray-400">({pct}%)</span>
      </div>
    </div>
  )
}

function RateGauge({ rate }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const filled = (rate / 100) * circ
  const color = rate >= 75 ? '#4a7c59' : rate >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-36 h-36">
      <svg width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="72" cy="72" r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 72 72)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-heading font-bold text-gf-dark">{rate}%</span>
        <span className="text-xs text-gray-500 font-body">Complete</span>
      </div>
    </div>
  )
}

function MonthlyChart({ data }) {
  const maxCount = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-2 overflow-x-auto pb-2">
      {data.map((d, i) => {
        const height = Math.round((d.count / maxCount) * 120)
        return (
          <div key={i} className="flex flex-col items-center gap-1 shrink-0 min-w-[48px]">
            <span className="text-xs text-gray-600 font-heading font-semibold">{d.count}</span>
            <div className="w-9 bg-gray-100 rounded-t-lg" style={{ height: '120px', display: 'flex', alignItems: 'flex-end' }}>
              <div
                className="w-full bg-gf-mid rounded-t-lg transition-all duration-500"
                style={{ height: `${height}px` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 font-body text-center leading-tight">{d.month}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FIELD REPORTS
═══════════════════════════════════════════════════════════════ */
function FieldReports({ user }) {
  const isFieldOrAdmin = user.role !== 'customer'
  const [farms, setFarms]         = useState([])
  const [selectedFarm, setSelectedFarm] = useState('')
  const [reports, setReports]     = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [pages, setPages]         = useState(1)
  const [loading, setLoading]     = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    getFarms(1, 100).then(r => {
      const list = r.data || []
      setFarms(list)
      if (list.length > 0) setSelectedFarm(list[0].id)
    })
  }, [])

  const reload = () => {
    if (!selectedFarm) return
    setLoading(true)
    getFarmReports(selectedFarm, page).then(r => {
      setReports(r.data || [])
      setTotal(r.total || 0)
      setPages(r.pages || 1)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { if (selectedFarm) reload() }, [selectedFarm, page])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {farms.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {farms.map(f => (
              <button key={f.id} onClick={() => { setSelectedFarm(f.id); setPage(1) }}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-body font-medium transition-colors
                  ${selectedFarm === f.id ? 'bg-gf-mid text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gf-mid'}`}>
                {f.name}
              </button>
            ))}
          </div>
        )}
        {isFieldOrAdmin && selectedFarm && (
          <button onClick={() => setShowCreate(true)}
            className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-dark transition-colors shrink-0">
            + Submit Report
          </button>
        )}
      </div>

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
                      <span className="text-xs text-amber-600 font-body font-semibold bg-amber-50 px-2 py-0.5 rounded-full hidden sm:inline">Next visit needed</span>
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
                              <img src={p.s3_url} alt={p.caption || 'Report photo'}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                                onError={e => { e.target.style.display = 'none' }} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {isFieldOrAdmin && <PhotoUpload reportId={report.id} onUploaded={reload} />}
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

/* ── Photo Upload ── */
function PhotoUpload({ reportId, onUploaded }) {
  const [file, setFile]         = useState(null)
  const [caption, setCaption]   = useState('')
  const [uploading, setUploading] = useState(false)
  const [done, setDone]         = useState(false)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      await uploadPhoto(reportId, file, caption)
      setDone(true); setFile(null); setCaption('')
      onUploaded()
    } catch {}
    setUploading(false)
  }

  if (done) return <p className="text-xs text-green-600 font-body">✓ Photo uploaded</p>
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
        className="text-xs font-body text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-gf-pale file:text-gf-dark file:font-semibold hover:file:bg-gf-light hover:file:text-white file:transition-colors" />
      <input type="text" value={caption} onChange={e => setCaption(e.target.value)}
        placeholder="Caption (optional)"
        className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-body focus:outline-none focus:ring-1 focus:ring-gf-mid w-36" />
      {file && (
        <button onClick={handleUpload} disabled={uploading}
          className="bg-gf-mid text-white text-xs font-heading font-semibold px-3 py-1 rounded-lg hover:bg-gf-dark disabled:opacity-60 transition-colors">
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      )}
    </div>
  )
}

/* ── Create Report Modal ── */
function CreateReportModal({ farmId, onClose, onCreated }) {
  const [form, setForm] = useState({ visit_date: '', arrival_time: '', departure_time: '', work_done: '', issues_found: '', next_visit_needed: false })
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true); setError('')
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
    } finally { setSaving(false) }
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
            <input required type="date" value={form.visit_date} onChange={e => set('visit_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Arrival Time</label>
              <input type="time" value={form.arrival_time} onChange={e => set('arrival_time', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Departure Time</label>
              <input type="time" value={form.departure_time} onChange={e => set('departure_time', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Work Done</label>
            <textarea value={form.work_done} onChange={e => set('work_done', e.target.value)} rows={3}
              placeholder="Describe what was done…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid resize-none" />
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Issues Found</label>
            <textarea value={form.issues_found} onChange={e => set('issues_found', e.target.value)} rows={2}
              placeholder="Any issues observed…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.next_visit_needed} onChange={e => set('next_visit_needed', e.target.checked)}
              className="w-4 h-4 rounded accent-gf-mid" />
            <span className="text-sm font-body text-gray-700">Next visit needed</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-dark disabled:opacity-60">
              {saving ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
