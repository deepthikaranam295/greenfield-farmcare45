import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getFarm, getFarmTasks, getFarmReports, updateFarm } from '../../api/farms'
import { createTask } from '../../api/tasks'
import { getUsers } from '../../api/users'
import { getCameras, createCamera, updateCamera, deleteCamera } from '../../api/cameras'
import { useAuth } from '../../hooks/useAuth'
import Badge from '../../components/dashboard/Badge'
import Pagination from '../../components/dashboard/Pagination'
import CameraPlayer from '../../components/dashboard/CameraPlayer'

const PLANS = ['none', 'basic', 'standard', 'premium']
const STATUSES = ['active', 'inactive', 'pending']
const DISTRICTS = ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Other']

export default function FarmDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [farm, setFarm] = useState(null)
  const [tasks, setTasks] = useState([])
  const [reports, setReports] = useState([])
  const [taskPages, setTaskPages] = useState(1)
  const [reportPages, setReportPages] = useState(1)
  const [taskPage, setTaskPage] = useState(1)
  const [reportPage, setReportPage] = useState(1)
  const [tab, setTab] = useState('tasks')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [cameras, setCameras] = useState([])
  const [showAddCamera, setShowAddCamera] = useState(false)
  const [editCamera, setEditCamera] = useState(null)
  const [showAddTask, setShowAddTask] = useState(false)

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

  const loadCameras = () => getCameras(id).then(setCameras).catch(() => {})

  useEffect(() => {
    if (!farm) return
    getFarmReports(id, reportPage).then(r => { setReports(r.data || []); setReportPages(r.pages || 1) })
  }, [farm, reportPage, id])

  useEffect(() => { if (farm) loadCameras() }, [farm, id])

  if (loading) return <div className="text-center py-20 text-gray-400 font-body">Loading…</div>
  if (error) return <div className="text-center py-20 text-red-500 font-body">{error}</div>
  if (!farm) return null

  return (
    <div className="space-y-6">
      {/* Back */}
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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {['tasks', 'reports', 'cameras'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-heading font-semibold capitalize transition-all ${
              tab === t ? 'bg-white shadow-sm text-gf-dark' : 'text-gray-500 hover:text-gf-dark'
            }`}
          >
            {t === 'cameras' ? `Cameras${cameras.length ? ` (${cameras.length})` : ''}` : t}
          </button>
        ))}
      </div>

      {/* Tasks */}
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
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Start Date</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">End Date</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tasks.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-body font-medium text-gf-dark capitalize">{t.task_type?.replace('_', ' ')}</td>
                    <td className="px-5 py-3"><Badge value={t.status} /></td>
                    <td className="px-5 py-3 text-gray-500 font-body hidden sm:table-cell">{t.scheduled_date || '—'}</td>
                    <td className="px-5 py-3 text-gray-500 font-body hidden lg:table-cell">{t.planned_end_date || '—'}</td>
                    <td className="px-5 py-3 text-gray-500 font-body text-xs hidden md:table-cell">{t.notes || '—'}</td>
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

      {/* Reports */}
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

      {/* Cameras */}
      {tab === 'cameras' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-body">
              {cameras.length === 0 ? 'No cameras added yet.' : `${cameras.length} camera${cameras.length > 1 ? 's' : ''}`}
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowAddCamera(true)}
                className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-light transition-colors"
              >
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
                  {cam.is_active ? (
                    <CameraPlayer camera={cam} />
                  ) : (
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
                        <button
                          onClick={() => setEditCamera(cam)}
                          className="text-xs text-gf-mid hover:underline font-body"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete camera "${cam.name}"?`)) return
                            await deleteCamera(id, cam.id)
                            loadCameras()
                          }}
                          className="text-xs text-red-500 hover:underline font-body"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showEdit && (
        <EditFarmModal
          farm={farm}
          onClose={() => setShowEdit(false)}
          onSaved={updated => { setFarm(updated); setShowEdit(false) }}
        />
      )}

      {showAddTask && (
        <AddTaskModal
          farmId={id}
          onClose={() => setShowAddTask(false)}
          onCreated={() => {
            setShowAddTask(false)
            getFarmTasks(id, taskPage).then(r => { setTasks(r.data || []); setTaskPages(r.pages || 1) })
          }}
        />
      )}

      {showAddCamera && (
        <CameraFormModal
          farmId={id}
          onClose={() => setShowAddCamera(false)}
          onSaved={() => { setShowAddCamera(false); loadCameras() }}
        />
      )}

      {editCamera && (
        <CameraFormModal
          farmId={id}
          camera={editCamera}
          onClose={() => setEditCamera(null)}
          onSaved={() => { setEditCamera(null); loadCameras() }}
        />
      )}
    </div>
  )
}

function EditFarmModal({ farm, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: farm.name || '',
    village: farm.village || '',
    mandal: farm.mandal || '',
    district: farm.district || '',
    size_acres: farm.size_acres ?? '',
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
              <input value={form.village} onChange={e => set('village', e.target.value)}
                placeholder="Village"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Mandal</label>
              <input value={form.mandal} onChange={e => set('mandal', e.target.value)}
                placeholder="Mandal"
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

const TASK_TYPES = ['irrigation', 'soil_test', 'fertilization', 'pest_control', 'harvesting', 'inspection', 'other']

function AddTaskModal({ farmId, onClose, onCreated }) {
  const [form, setForm] = useState({ task_type: 'irrigation', assigned_to: '', scheduled_date: '', planned_end_date: '', notes: '' })
  const [workers, setWorkers] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getUsers(1, 100).then(res => {
      const list = res.data || []
      setWorkers(list.filter(u => ['field_team', 'farm_worker'].includes(u.role) && u.is_active))
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
      if (isEdit) {
        await updateCamera(farmId, camera.id, form)
      } else {
        await createCamera(farmId, form)
      }
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
