import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getFarm, getFarmTasks, getFarmReports, updateFarm } from '../../api/farms'
import { createTask } from '../../api/tasks'
import { getUsers } from '../../api/users'
import { getActivities, createActivity, deleteActivity } from '../../api/activities'
import { getCameras, createCamera, updateCamera, deleteCamera } from '../../api/cameras'
import { useAuth } from '../../hooks/useAuth'
import Badge from '../../components/dashboard/Badge'
import Pagination from '../../components/dashboard/Pagination'
import CameraPlayer from '../../components/dashboard/CameraPlayer'

const PLANS = ['none', 'basic', 'standard', 'premium']
const STATUSES = ['active', 'inactive', 'pending']
const DISTRICTS = ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Other']

const FEATURE_CARDS = [
  {
    key: 'activities',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    label: 'Activity & Expenses',
    desc: 'Log costs, income & field notes',
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
  },
  {
    key: 'map',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    label: 'Field Map',
    desc: 'View farm location on map',
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'ring-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
  },
  {
    key: 'cameras',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Live Cameras',
    desc: 'Watch live farm streams',
    gradient: 'from-violet-500 to-purple-600',
    ring: 'ring-violet-200',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
  },
]

export default function FarmDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const canLog = ['admin', 'field_team', 'farm_worker'].includes(user?.role)

  const [farm, setFarm]           = useState(null)
  const [tasks, setTasks]         = useState([])
  const [reports, setReports]     = useState([])
  const [cameras, setCameras]     = useState([])
  const [activities, setActivities] = useState([])

  const [taskPages, setTaskPages]     = useState(1)
  const [reportPages, setReportPages] = useState(1)
  const [activityPages, setActPages]  = useState(1)
  const [taskPage, setTaskPage]       = useState(1)
  const [reportPage, setReportPage]   = useState(1)
  const [activityPage, setActPage]    = useState(1)

  const [tab, setTab]             = useState(null)   // null = show feature cards
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [showEdit, setShowEdit]   = useState(false)
  const [showAddTask, setShowAddTask]     = useState(false)
  const [showAddCamera, setShowAddCamera] = useState(false)
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [editCamera, setEditCamera]       = useState(null)

  useEffect(() => {
    getFarm(id)
      .then(setFarm)
      .catch(() => setError('Farm not found or access denied'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!farm) return
    getFarmTasks(id, taskPage).then(r => { setTasks(r.data || []); setTaskPages(r.pages || 1) })
  }, [farm, taskPage, id])

  useEffect(() => {
    if (!farm) return
    getFarmReports(id, reportPage).then(r => { setReports(r.data || []); setReportPages(r.pages || 1) })
  }, [farm, reportPage, id])

  useEffect(() => {
    if (!farm) return
    getActivities(id, activityPage).then(r => { setActivities(r.data || []); setActPages(r.pages || 1) })
  }, [farm, activityPage, id])

  const loadCameras = () => getCameras(id).then(setCameras).catch(() => {})
  useEffect(() => { if (farm) loadCameras() }, [farm, id])

  const reloadActivities = () =>
    getActivities(id, activityPage).then(r => { setActivities(r.data || []); setActPages(r.pages || 1) })

  if (loading) return <div className="text-center py-20 text-gray-400 font-body">Loading…</div>
  if (error)   return <div className="text-center py-20 text-red-500 font-body">{error}</div>
  if (!farm)   return null

  // mapLink kept for "Open in OSM" button
  const mapLink = farm.gps_lat && farm.gps_lng
    ? `https://www.openstreetmap.org/?mlat=${farm.gps_lat}&mlon=${farm.gps_lng}#map=15/${farm.gps_lat}/${farm.gps_lng}`
    : `https://www.openstreetmap.org/search?query=${encodeURIComponent([farm.village, farm.mandal, farm.district, 'India'].filter(Boolean).join(', '))}`

  return (
    <div className="space-y-6">
      <Link to="/dashboard/farms" className="text-sm text-gf-mid hover:underline font-body">← All Farms</Link>

      {/* Farm header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading font-bold text-2xl text-gf-dark">{farm.name}</h1>
            <p className="text-gray-500 text-sm font-body mt-1">
              {[farm.village, farm.mandal, farm.district].filter(Boolean).join(', ')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge value={farm.status} />
            <Badge value={farm.subscription_plan} />
            {isAdmin && (
              <button
                onClick={() => setShowEdit(true)}
                className="ml-1 px-3 py-1 text-xs font-heading font-semibold bg-gf-mid text-white rounded-lg hover:bg-gf-light transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Size', value: farm.size_acres ? `${farm.size_acres} acres` : '—' },
            { label: 'Village', value: farm.village || '—' },
            { label: 'Mandal', value: farm.mandal || '—' },
            { label: 'District', value: farm.district || '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-body uppercase tracking-wide">{label}</p>
              <p className="font-body font-medium text-gf-dark text-sm mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {FEATURE_CARDS.map(card => (
          <button
            key={card.key}
            onClick={() => setTab(prev => prev === card.key ? null : card.key)}
            className={`relative group rounded-2xl overflow-hidden text-left transition-all shadow-sm border-2
              ${tab === card.key ? `border-transparent ring-4 ${card.ring} shadow-lg` : 'border-transparent hover:shadow-md'}`}
          >
            <div className={`bg-gradient-to-br ${card.gradient} p-6 text-white`}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-xl">
                  {card.icon}
                </div>
                {tab === card.key && (
                  <span className="text-xs bg-white/20 font-heading font-semibold px-2 py-1 rounded-full">Open</span>
                )}
              </div>
              <p className="font-heading font-bold text-lg leading-tight">{card.label}</p>
              <p className="text-white/70 text-xs font-body mt-1">{card.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Secondary tabs: Tasks & Reports */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {['tasks', 'reports'].map(t => (
          <button
            key={t}
            onClick={() => setTab(prev => prev === t ? null : t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-heading font-semibold capitalize transition-all ${
              tab === t ? 'bg-white shadow-sm text-gf-dark' : 'text-gray-500 hover:text-gf-dark'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Activities ── */}
      {tab === 'activities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-gf-dark">Activity & Expenses</h2>
            {canLog && (
              <button onClick={() => setShowAddActivity(true)}
                className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-light transition-colors">
                + Add Entry
              </button>
            )}
          </div>

          {/* Summary cards */}
          <ActivitySummary activities={activities} />

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {activities.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-12 font-body">
                No entries yet.{canLog ? ' Click "+ Add Entry" to start tracking.' : ''}
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Description</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Amount</th>
                    {isAdmin && <th className="px-5 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activities.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-gray-500 font-body text-sm">{a.date}</td>
                      <td className="px-5 py-3">
                        <ActivityTypeBadge type={a.type} />
                      </td>
                      <td className="px-5 py-3 font-body text-gf-dark text-sm">{a.description}</td>
                      <td className="px-5 py-3 font-body font-semibold text-sm">
                        {a.amount != null ? (
                          <span className={a.type === 'expense' ? 'text-red-600' : a.type === 'income' ? 'text-emerald-600' : 'text-gray-500'}>
                            {a.type === 'expense' ? '−' : a.type === 'income' ? '+' : ''}
                            {a.amount != null ? `₹${a.amount.toLocaleString('en-IN')}` : ''}
                          </span>
                        ) : '—'}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={async () => {
                              if (!confirm('Delete this entry?')) return
                              await deleteActivity(id, a.id)
                              reloadActivities()
                            }}
                            className="text-xs text-red-500 hover:underline font-body"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="px-5 py-3 border-t border-gray-100">
              <Pagination page={activityPage} pages={activityPages} onPage={setActPage} />
            </div>
          </div>
        </div>
      )}

      {/* ── Field Map ── */}
      {tab === 'map' && (
        <FieldMapPanel
          farm={farm}
          isAdmin={isAdmin}
          mapLink={mapLink}
          onFarmUpdate={updated => setFarm(updated)}
        />
      )}

      {/* ── Cameras ── */}
      {tab === 'cameras' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg text-gf-dark">
              Live Cameras {cameras.length > 0 && <span className="text-gray-400 font-body font-normal text-sm">({cameras.length})</span>}
            </h2>
            {isAdmin && (
              <button onClick={() => setShowAddCamera(true)}
                className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-light transition-colors">
                + Add Camera
              </button>
            )}
          </div>

          {cameras.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400 font-body text-sm">
              {isAdmin ? 'Add a camera stream URL to start monitoring this farm.' : 'No cameras available for this farm.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameras.map(cam => (
                <div key={cam.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {cam.is_active ? <CameraPlayer camera={cam} /> : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-body">
                      Camera offline
                    </div>
                  )}
                  <div className="px-4 py-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-heading font-semibold text-gf-dark text-sm">{cam.name}</p>
                      {cam.description && <p className="text-xs text-gray-400 font-body mt-0.5">{cam.description}</p>}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => setEditCamera(cam)} className="text-xs text-gf-mid hover:underline font-body">Edit</button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete camera "${cam.name}"?`)) return
                            await deleteCamera(id, cam.id)
                            loadCameras()
                          }}
                          className="text-xs text-red-500 hover:underline font-body"
                        >Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tasks ── */}
      {tab === 'tasks' && (
        <div className="space-y-3">
          {isAdmin && (
            <div className="flex justify-end">
              <button onClick={() => setShowAddTask(true)}
                className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-light transition-colors">
                + Add Task
              </button>
            </div>
          )}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {tasks.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-12 font-body">No tasks yet.{isAdmin ? ' Click "+ Add Task" to create one.' : ''}</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">ID</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Task</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Assigned To</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan End</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-xs text-gray-400 font-body font-mono">
                        {t.task_number ? `TASK-${String(t.task_number).padStart(3,'0')}` : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-body font-medium text-gf-dark capitalize leading-tight">
                          {t.task_name || t.task_type?.replace(/_/g,' ')}
                        </p>
                        {t.task_name && <p className="text-xs text-gray-400 capitalize">{t.task_type?.replace(/_/g,' ')}</p>}
                      </td>
                      <td className="px-5 py-3 text-sm font-body hidden md:table-cell">
                        {t.assigned_field_team_name
                          ? <span className="text-gray-700">{t.assigned_field_team_name}</span>
                          : <span className="text-amber-600 font-semibold text-xs">Unassigned</span>}
                      </td>
                      <td className="px-5 py-3"><Badge value={t.status} /></td>
                      <td className="px-5 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">{t.planned_end_date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="px-5 py-3 border-t border-gray-100">
              <Pagination page={taskPage} pages={taskPages} onPage={setTaskPage} />
            </div>
          </div>
        </div>
      )}

      {/* ── Reports ── */}
      {tab === 'reports' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {reports.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12 font-body">No reports for this farm.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Visit Date</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Work Done</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Next Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-body font-medium text-gf-dark">{r.visit_date}</td>
                    <td className="px-5 py-3"><Badge value={r.status} /></td>
                    <td className="px-5 py-3 text-gray-500 font-body text-xs hidden sm:table-cell line-clamp-2">{r.work_done || '—'}</td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className={`text-xs font-body ${r.next_visit_needed ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                        {r.next_visit_needed ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="px-5 py-3 border-t border-gray-100">
            <Pagination page={reportPage} pages={reportPages} onPage={setReportPage} />
          </div>
        </div>
      )}

      {/* Modals */}
      {showEdit && (
        <EditFarmModal farm={farm} onClose={() => setShowEdit(false)}
          onSaved={updated => { setFarm(updated); setShowEdit(false) }} />
      )}
      {showAddTask && (
        <AddTaskModal farmId={id} onClose={() => setShowAddTask(false)}
          onCreated={() => {
            setShowAddTask(false)
            getFarmTasks(id, taskPage).then(r => { setTasks(r.data || []); setTaskPages(r.pages || 1) })
          }} />
      )}
      {showAddActivity && (
        <AddActivityModal farmId={id} onClose={() => setShowAddActivity(false)}
          onCreated={() => { setShowAddActivity(false); reloadActivities() }} />
      )}
      {showAddCamera && (
        <CameraFormModal farmId={id} onClose={() => setShowAddCamera(false)}
          onSaved={() => { setShowAddCamera(false); loadCameras() }} />
      )}
      {editCamera && (
        <CameraFormModal farmId={id} camera={editCamera} onClose={() => setEditCamera(null)}
          onSaved={() => { setEditCamera(null); loadCameras() }} />
      )}
    </div>
  )
}

/* ── Field Map Panel ── */
function geodesicArea(latlngs) {
  const R = 6371000
  let total = 0
  const n = latlngs.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const lat1 = latlngs[i].lat * Math.PI / 180
    const lat2 = latlngs[j].lat * Math.PI / 180
    const dLng = (latlngs[j].lng - latlngs[i].lng) * Math.PI / 180
    total += dLng * (2 + Math.sin(lat1) + Math.sin(lat2))
  }
  return Math.abs(total * R * R / 2)
}

function fmtArea(m2) {
  const acres = m2 / 4046.86
  if (acres < 0.01) return `${Math.round(m2)} m²`
  return `${acres.toFixed(2)} acres`
}

function FieldMapPanel({ farm, isAdmin, mapLink, onFarmUpdate }) {
  const mapDivRef  = useRef(null)
  const mapObjRef  = useRef(null)
  const drawnRef   = useRef(null)

  const [areaM2, setAreaM2]         = useState(null)
  const [pendingGJ, setPendingGJ]   = useState(null)
  const [saving, setSaving]         = useState(false)
  const [saveErr, setSaveErr]       = useState('')
  const [saveOk, setSaveOk]         = useState(false)
  const [coordsText, setCoordsText] = useState('')
  const [coordErr, setCoordErr]     = useState('')
  const [showCoords, setShowCoords] = useState(false)

  useEffect(() => {
    const L = window.L
    if (!L || !mapDivRef.current) return

    // Destroy previous instance if re-rendering
    if (mapObjRef.current) { mapObjRef.current.remove(); mapObjRef.current = null }

    const center = farm.gps_lat && farm.gps_lng ? [farm.gps_lat, farm.gps_lng] : [14.68, 77.61]
    const map = L.map(mapDivRef.current).setView(center, farm.boundary_geojson ? 14 : (farm.gps_lat ? 15 : 10))

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Draw saved boundary if present
    if (farm.boundary_geojson) {
      try {
        const parsed = JSON.parse(farm.boundary_geojson)
        const layer = L.geoJSON(parsed, {
          style: { color: '#4d7c0f', weight: 3, fillColor: '#84cc16', fillOpacity: 0.25 }
        }).addTo(map)
        map.fitBounds(layer.getBounds(), { padding: [40, 40] })
        const coords = parsed.coordinates?.[0]
        if (coords) setAreaM2(geodesicArea(coords.map(([lng, lat]) => ({ lat, lng }))))
      } catch {}
    } else if (farm.gps_lat && farm.gps_lng) {
      L.marker([farm.gps_lat, farm.gps_lng]).addTo(map)
    }

    // Add Geoman drawing controls for admin
    if (isAdmin && map.pm) {
      map.pm.addControls({
        position: 'topleft',
        drawMarker: false,
        drawCircle: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        editMode: true,
        dragMode: false,
        cutPolygon: false,
        removalMode: true,
      })

      map.on('pm:create', ({ layer }) => {
        if (drawnRef.current) drawnRef.current.remove()
        drawnRef.current = layer
        const gj = layer.toGeoJSON()
        const latlngs = layer.getLatLngs()[0]
        const m2 = geodesicArea(latlngs)
        setAreaM2(m2)
        setPendingGJ(JSON.stringify(gj.geometry))
        setSaveOk(false)
      })

      map.on('pm:edit', ({ layer }) => {
        if (!layer.toGeoJSON) return
        const gj = layer.toGeoJSON()
        const latlngs = layer.getLatLngs()[0]
        const m2 = geodesicArea(latlngs)
        setAreaM2(m2)
        setPendingGJ(JSON.stringify(gj.geometry))
        setSaveOk(false)
      })

      map.on('pm:remove', () => {
        drawnRef.current = null
        setPendingGJ(null)
        setAreaM2(farm.boundary_geojson
          ? (() => { try { const p = JSON.parse(farm.boundary_geojson); return geodesicArea(p.coordinates[0].map(([lng,lat])=>({lat,lng}))) } catch { return null } })()
          : null)
        setSaveOk(false)
      })
    }

    mapObjRef.current = map
    return () => { if (mapObjRef.current) { mapObjRef.current.remove(); mapObjRef.current = null } }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!pendingGJ) return
    setSaving(true); setSaveErr(''); setSaveOk(false)
    try {
      const coords = JSON.parse(pendingGJ).coordinates[0]
      const avgLat = coords.reduce((s, [, lat]) => s + lat, 0) / coords.length
      const avgLng = coords.reduce((s, [lng]) => s + lng, 0) / coords.length
      const acres  = areaM2 ? parseFloat((areaM2 / 4046.86).toFixed(2)) : farm.size_acres

      const updated = await updateFarm(farm.id, {
        boundary_geojson: pendingGJ,
        gps_lat: farm.gps_lat || avgLat,
        gps_lng: farm.gps_lng || avgLng,
        size_acres: acres,
      })
      onFarmUpdate(updated)
      setPendingGJ(null)
      setSaveOk(true)
    } catch {
      setSaveErr('Failed to save boundary. Please try again.')
    } finally { setSaving(false) }
  }

  const hasBoundary = !!farm.boundary_geojson

  const plotFromCoords = () => {
    setCoordErr('')
    const L = window.L
    if (!L || !mapObjRef.current) return

    // Parse lines — accept "lat, lng", "lat lng", or "lat,lng"
    const lines = coordsText.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 3) { setCoordErr('At least 3 coordinate points are needed to form a polygon.'); return }

    const latlngs = []
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(/[\s,]+/).filter(Boolean)
      if (parts.length < 2) { setCoordErr(`Line ${i + 1}: "${lines[i]}" — expected "lat, lng"`); return }
      const lat = parseFloat(parts[0])
      const lng = parseFloat(parts[1])
      if (isNaN(lat) || isNaN(lng)) { setCoordErr(`Line ${i + 1}: "${lines[i]}" — not valid numbers`); return }
      if (lat < -90 || lat > 90)   { setCoordErr(`Line ${i + 1}: latitude ${lat} is out of range (-90 to 90)`); return }
      if (lng < -180 || lng > 180) { setCoordErr(`Line ${i + 1}: longitude ${lng} is out of range (-180 to 180)`); return }
      latlngs.push({ lat, lng })
    }

    // Remove old drawn layer
    if (drawnRef.current) { drawnRef.current.remove(); drawnRef.current = null }

    // Draw polygon on map
    const poly = L.polygon(latlngs, {
      color: '#4d7c0f', weight: 3, fillColor: '#84cc16', fillOpacity: 0.25,
    }).addTo(mapObjRef.current)

    mapObjRef.current.fitBounds(poly.getBounds(), { padding: [40, 40] })
    drawnRef.current = poly

    const m2 = geodesicArea(latlngs)
    setAreaM2(m2)

    // Build GeoJSON Polygon geometry
    const ring = [...latlngs, latlngs[0]].map(({ lat, lng }) => [lng, lat])
    setPendingGJ(JSON.stringify({ type: 'Polygon', coordinates: [ring] }))
    setSaveOk(false)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-heading font-bold text-lg text-gf-dark">Field Map</h2>
          {areaM2 != null && (
            <p className="text-sm text-gf-mid font-body font-semibold mt-0.5">
              Area: {fmtArea(areaM2)}
            </p>
          )}
        </div>
        <a href={mapLink} target="_blank" rel="noopener noreferrer"
          className="text-xs text-gf-mid font-body hover:underline">
          Open in OpenStreetMap →
        </a>
      </div>

      {/* Info banners */}
      {isAdmin && !hasBoundary && (
        <p className="text-xs text-blue-700 font-body bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          Draw a polygon on the map using the toolbar on the left, <strong>or</strong> enter GPS coordinates below to auto-generate the boundary.
        </p>
      )}
      {!hasBoundary && !isAdmin && (
        <p className="text-xs text-amber-600 font-body bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          No boundary has been drawn for this farm yet.
        </p>
      )}
      {saveErr && (
        <p className="text-xs text-red-600 font-body bg-red-50 border border-red-200 rounded-lg px-3 py-2">{saveErr}</p>
      )}
      {saveOk && (
        <p className="text-xs text-green-700 font-body bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          Boundary saved successfully.
        </p>
      )}

      {/* Map */}
      <div ref={mapDivRef} className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 480 }} />

      {/* Coordinate entry panel */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowCoords(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm font-heading font-semibold text-gf-dark hover:bg-gray-50 transition-colors"
          >
            <span>Enter Boundary Coordinates (GPS Survey)</span>
            <span className="text-gray-400 text-xs font-body">{showCoords ? '▲ Hide' : '▼ Show'}</span>
          </button>

          {showCoords && (
            <div className="px-5 pb-5 space-y-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-body pt-3">
                Paste one coordinate per line in <strong>Latitude, Longitude</strong> format. At least 3 points needed.
                You can copy these from Google Maps (right-click a point → copy coordinates).
              </p>

              {/* Example hint */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-xs text-gray-500 select-all">
                14.6832, 77.6101<br />
                14.6845, 77.6118<br />
                14.6838, 77.6130<br />
                14.6819, 77.6115
              </div>

              <textarea
                value={coordsText}
                onChange={e => { setCoordsText(e.target.value); setCoordErr('') }}
                rows={6}
                placeholder={'14.6832, 77.6101\n14.6845, 77.6118\n14.6838, 77.6130\n14.6819, 77.6115'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gf-mid resize-y"
              />

              {coordErr && (
                <p className="text-xs text-red-600 font-body bg-red-50 border border-red-200 rounded-lg px-3 py-2">{coordErr}</p>
              )}

              <button
                onClick={plotFromCoords}
                disabled={!coordsText.trim()}
                className="bg-gf-mid text-white font-heading font-semibold px-5 py-2 rounded-lg text-sm hover:bg-gf-dark disabled:opacity-50 transition-colors"
              >
                Generate Boundary on Map
              </button>
            </div>
          )}
        </div>
      )}

      {/* Save button */}
      {isAdmin && pendingGJ && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gf-mid text-white font-heading font-semibold px-5 py-2 rounded-lg text-sm hover:bg-gf-dark disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Boundary'}
          </button>
          {areaM2 != null && (
            <span className="text-sm text-gray-500 font-body">
              Calculated area: <strong>{fmtArea(areaM2)}</strong> — will update farm size field on save.
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 font-body text-center">
        Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenStreetMap</a> contributors
      </p>
    </div>
  )
}

/* ── Activity Summary ── */
function ActivitySummary({ activities }) {
  const totalExpense = activities.filter(a => a.type === 'expense').reduce((s, a) => s + (a.amount || 0), 0)
  const totalIncome  = activities.filter(a => a.type === 'income').reduce((s, a) => s + (a.amount || 0), 0)
  const net = totalIncome - totalExpense

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Total Income', value: `₹${totalIncome.toLocaleString('en-IN')}`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        { label: 'Total Expenses', value: `₹${totalExpense.toLocaleString('en-IN')}`, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
        { label: 'Net', value: `₹${Math.abs(net).toLocaleString('en-IN')}`, color: net >= 0 ? 'text-emerald-600' : 'text-red-600', bg: 'bg-white border-gray-100' },
      ].map(({ label, value, color, bg }) => (
        <div key={label} className={`rounded-xl border p-4 ${bg}`}>
          <p className="text-xs text-gray-500 font-body uppercase tracking-wide">{label}</p>
          <p className={`font-heading font-bold text-xl mt-1 ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}

/* ── Activity Type Badge ── */
function ActivityTypeBadge({ type }) {
  const styles = {
    expense:  'bg-red-100 text-red-700',
    income:   'bg-emerald-100 text-emerald-700',
    activity: 'bg-blue-100 text-blue-700',
    note:     'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-block text-xs font-heading font-semibold px-2.5 py-1 rounded-full capitalize ${styles[type] || 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  )
}

/* ── Add Activity Modal ── */
const ACTIVITY_TYPES = ['expense', 'income', 'activity', 'note']

function AddActivityModal({ farmId, onClose, onCreated }) {
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], type: 'expense', description: '', amount: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const needsAmount = ['expense', 'income'].includes(form.type)

  const submit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createActivity(farmId, {
        date: form.date,
        type: form.type,
        description: form.description,
        amount: needsAmount && form.amount ? parseFloat(form.amount) : null,
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-gf-dark">Add Activity / Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Date *</label>
              <input required type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Type *</label>
              <select required value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
                {ACTIVITY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Description *</label>
            <input required value={form.description} onChange={e => set('description', e.target.value)}
              placeholder={form.type === 'expense' ? 'e.g. Fertilizer purchase' : form.type === 'income' ? 'e.g. Crop sale' : 'e.g. Irrigation check done'}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>

          {needsAmount && (
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Amount (₹)</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-light disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Edit Farm Modal ── */
function EditFarmModal({ farm, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: farm.name || '',
    village: farm.village || '',
    mandal: farm.mandal || '',
    district: farm.district || '',
    size_acres: farm.size_acres ?? '',
    gps_lat: farm.gps_lat ?? '',
    gps_lng: farm.gps_lng ?? '',
    status: farm.status || 'active',
    subscription_plan: farm.subscription_plan || 'none',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const updated = await updateFarm(farm.id, {
        ...form,
        size_acres: form.size_acres !== '' ? parseFloat(form.size_acres) : null,
        gps_lat: form.gps_lat !== '' ? parseFloat(form.gps_lat) : null,
        gps_lng: form.gps_lng !== '' ? parseFloat(form.gps_lng) : null,
      })
      onSaved(updated)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-gf-dark">Edit Farm</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Farm Name *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Venkat Farm A"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Village</label>
              <input value={form.village} onChange={e => set('village', e.target.value)} placeholder="Village"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Mandal</label>
              <input value={form.mandal} onChange={e => set('mandal', e.target.value)} placeholder="Mandal"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">State / District</label>
              <select value={form.district} onChange={e => set('district', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
                <option value="">Select…</option>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Size (acres)</label>
              <input type="number" value={form.size_acres} onChange={e => set('size_acres', e.target.value)}
                placeholder="e.g. 12.5"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">GPS Latitude</label>
              <input type="number" step="any" value={form.gps_lat} onChange={e => set('gps_lat', e.target.value)}
                placeholder="e.g. 14.6832"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">GPS Longitude</label>
              <input type="number" step="any" value={form.gps_lng} onChange={e => set('gps_lng', e.target.value)}
                placeholder="e.g. 77.6101"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
                {STATUSES.map(s => <option key={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Subscription Plan</label>
              <select value={form.subscription_plan} onChange={e => set('subscription_plan', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
                {PLANS.map(p => <option key={p} className="capitalize">{p}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-light disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Add Task Modal ── */
const TASK_TYPES = ['irrigation', 'soil_test', 'fertilization', 'pest_control', 'harvesting', 'inspection', 'other']

function AddTaskModal({ farmId, onClose, onCreated }) {
  const [form, setForm] = useState({ task_type: 'irrigation', assigned_to: '', scheduled_date: '', planned_end_date: '', notes: '' })
  const [workers, setWorkers] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getUsers(1, 100, 'field_team').then(res => {
      setWorkers((res.data || []).filter(u => u.is_active))
    }).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createTask({
        farm_id: farmId,
        task_type: form.task_type,
        assigned_to: form.assigned_to || null,
        scheduled_date: form.scheduled_date || null,
        planned_end_date: form.planned_end_date || null,
        notes: form.notes || null,
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-gf-dark">Add Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Task Type *</label>
            <select required value={form.task_type} onChange={e => set('task_type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
              {TASK_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Assign To</label>
            <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
              <option value="">-- Unassigned --</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.role.replace('_', ' ')})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Planned Start Date</label>
              <input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Planned End Date</label>
              <input type="date" value={form.planned_end_date} onChange={e => set('planned_end_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              placeholder="Details about this task…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-light disabled:opacity-60 transition-colors">
              {saving ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Camera Form Modal ── */
function CameraFormModal({ farmId, camera, onClose, onSaved }) {
  const isEdit = !!camera
  const [form, setForm] = useState({
    name: camera?.name || '',
    stream_url: camera?.stream_url || '',
    description: camera?.description || '',
    is_active: camera?.is_active ?? true,
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) await updateCamera(farmId, camera.id, form)
      else await createCamera(farmId, form)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save camera')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-gf-dark">{isEdit ? 'Edit Camera' : 'Add Camera'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Camera Name *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Main Gate, Crop Field 1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Stream URL *</label>
            <input required value={form.stream_url} onChange={e => set('stream_url', e.target.value)}
              placeholder="https://example.com/stream.m3u8"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            <p className="text-xs text-gray-400 mt-1 font-body">Supports HLS (.m3u8), MP4, or WebM URLs.</p>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Description</label>
            <input value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Optional — e.g. North boundary fence camera"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)}
              className="w-4 h-4 accent-gf-mid" />
            <span className="text-sm font-body text-gray-700">Camera is active</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-light disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Camera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
