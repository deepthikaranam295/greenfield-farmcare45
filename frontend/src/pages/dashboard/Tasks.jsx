import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getMyTasks, updateTaskStatus } from '../../api/tasks'
import { getFarms } from '../../api/farms'
import { createTask } from '../../api/tasks'
import Badge from '../../components/dashboard/Badge'
import Pagination from '../../components/dashboard/Pagination'

const TASK_TYPES = ['soil_test', 'irrigation', 'fertilization', 'pest_control', 'harvesting', 'inspection', 'other']
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled']

export default function Tasks() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'
  const [tasks, setTasks] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const load = (p = 1) => {
    setLoading(true)
    getMyTasks(p, 15).then(res => {
      setTasks(res.data || [])
      setTotal(res.total || 0)
      setPages(res.pages || 1)
      setPage(res.page || p)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId)
    try {
      const updated = await updateTaskStatus(taskId, { status: newStatus })
      setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status: updated.status } : t))
    } catch {}
    setUpdatingId(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gf-dark">Tasks</h1>
          <p className="text-gray-500 text-sm font-body">{total} total tasks</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-light transition-colors"
          >
            + New Task
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 font-body">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-body">No tasks assigned to you.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Task Type</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Scheduled</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Notes</th>
                    {!isAdmin && <th className="px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-body font-medium text-gf-dark capitalize">{task.task_type?.replace('_', ' ')}</p>
                      </td>
                      <td className="px-5 py-3"><Badge value={task.status} /></td>
                      <td className="px-5 py-3 text-gray-500 font-body hidden sm:table-cell">{task.scheduled_date || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 font-body text-xs hidden md:table-cell">{task.notes || '—'}</td>
                      {!isAdmin && (
                        <td className="px-5 py-3">
                          <select
                            value={task.status}
                            disabled={updatingId === task.id || task.status === 'completed' || task.status === 'cancelled'}
                            onChange={e => handleStatusChange(task.id, e.target.value)}
                            className="border border-gray-200 rounded-lg text-xs font-body px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gf-mid disabled:opacity-50"
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </td>
                      )}
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

      {showCreate && (
        <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load() }} />
      )}
    </div>
  )
}

function CreateTaskModal({ onClose, onCreated }) {
  const [farms, setFarms] = useState([])
  const [form, setForm] = useState({ farm_id: '', assigned_to: '', task_type: 'inspection', scheduled_date: '', notes: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getFarms(1, 100).then(r => setFarms(r.data || []))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createTask({
        farm_id: form.farm_id,
        assigned_to: form.assigned_to || null,
        task_type: form.task_type,
        scheduled_date: form.scheduled_date || null,
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
          <h2 className="font-heading font-bold text-gf-dark">Create Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Farm *</label>
            <select required value={form.farm_id} onChange={e => set('farm_id', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
              <option value="">Select a farm</option>
              {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Task Type *</label>
            <select required value={form.task_type} onChange={e => set('task_type', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
              {TASK_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Assign To (User UUID)</label>
            <input type="text" value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} placeholder="Leave blank to unassign" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Scheduled Date</label>
            <input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>
          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Optional notes" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-light disabled:opacity-60">
              {saving ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
