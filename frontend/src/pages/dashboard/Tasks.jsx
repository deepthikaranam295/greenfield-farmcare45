import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getMyTasks, updateTaskStatus, createTask } from '../../api/tasks'
import { getFarms } from '../../api/farms'
import { getUsers } from '../../api/users'
import Badge from '../../components/dashboard/Badge'
import Pagination from '../../components/dashboard/Pagination'

const TASK_TYPES = ['soil_test', 'irrigation', 'fertilization', 'pest_control', 'harvesting', 'inspection', 'other']
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled']
const PRIORITY_STYLE = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-gray-100 text-gray-600',
}

function DelayBadge({ delayDays, status, plannedEndDate }) {
  if (status === 'cancelled') return null
  if (status === 'completed' && delayDays !== null && delayDays !== undefined) {
    if (delayDays <= 0) return <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">On time</span>
    return <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">+{delayDays}d late</span>
  }
  if (plannedEndDate && status !== 'completed') {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const end = new Date(plannedEndDate)
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
    if (diff < 0) return <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">Overdue</span>
    if (diff <= 3) return <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">Due in {diff}d</span>
  }
  return null
}

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
  const [sortBy, setSortBy] = useState('planned_end_date')
  const [groupBy, setGroupBy] = useState('none')
  const [statusFilter, setStatusFilter] = useState('')

  const load = (p = 1, sort = sortBy, sf = statusFilter) => {
    setLoading(true)
    getMyTasks(p, 20, sort, sf || null).then(res => {
      setTasks(res.data || [])
      setTotal(res.total || 0)
      setPages(res.pages || 1)
      setPage(res.page || p)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load(1, sortBy, statusFilter) }, [sortBy, statusFilter])

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId)
    try {
      const updated = await updateTaskStatus(taskId, { status: newStatus })
      setTasks(ts => ts.map(t => t.id === taskId ? { ...t, ...updated } : t))
    } catch {}
    setUpdatingId(null)
  }

  const groupedTasks = () => {
    if (groupBy === 'none') return [{ key: null, label: null, items: tasks }]
    if (groupBy === 'status') {
      const groups = {}
      tasks.forEach(t => { if (!groups[t.status]) groups[t.status] = []; groups[t.status].push(t) })
      return Object.entries(groups).map(([k, v]) => ({ key: k, label: k.replace('_', ' '), items: v }))
    }
    if (groupBy === 'priority') {
      const order = ['high', 'medium', 'low', 'null']
      const groups = {}
      tasks.forEach(t => { const k = t.priority || 'null'; if (!groups[k]) groups[k] = []; groups[k].push(t) })
      return order.filter(k => groups[k]).map(k => ({ key: k, label: k === 'null' ? 'No Priority' : k, items: groups[k] }))
    }
    return [{ key: null, label: null, items: tasks }]
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
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

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-body text-gray-500 whitespace-nowrap">Sort by</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-body focus:outline-none focus:ring-1 focus:ring-gf-mid bg-white">
            <option value="planned_end_date">Planned End Date</option>
            <option value="scheduled_date">Planned Start Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div className="w-px h-4 bg-gray-200 hidden sm:block" />
        <div className="flex items-center gap-2">
          <label className="text-xs font-body text-gray-500 whitespace-nowrap">Group by</label>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-body focus:outline-none focus:ring-1 focus:ring-gf-mid bg-white">
            <option value="none">None</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        <div className="w-px h-4 bg-gray-200 hidden sm:block" />
        <div className="flex items-center gap-2">
          <label className="text-xs font-body text-gray-500 whitespace-nowrap">Filter status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-body focus:outline-none focus:ring-1 focus:ring-gf-mid bg-white">
            <option value="">All</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 font-body">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center text-gray-400 font-body">No tasks found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Priority</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Task</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan Start</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan End</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Actual Start</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Actual End</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Delay</th>
                    {!isAdmin && <th className="px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Update</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {groupedTasks().map(group => (
                    <GroupRows key={group.key || 'default'} group={group} isAdmin={isAdmin} updatingId={updatingId} onStatusChange={handleStatusChange} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-gray-100">
              <Pagination page={page} pages={pages} onPage={p => load(p)} />
            </div>
          </>
        )}
      </div>

      {showCreate && (
        <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(1) }} />
      )}
    </div>
  )
}

function GroupRows({ group, isAdmin, updatingId, onStatusChange }) {
  return (
    <>
      {group.label && (
        <tr>
          <td colSpan={9} className="px-4 py-2 bg-gf-pale/30 border-y border-gf-pale">
            <span className="text-xs font-heading font-bold text-gf-dark uppercase tracking-wide capitalize">{group.label}</span>
          </td>
        </tr>
      )}
      {group.items.map(task => (
        <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
          <td className="px-4 py-3">
            {task.priority && (
              <span className={`inline-block text-xs font-heading font-semibold px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLE[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                {task.priority}
              </span>
            )}
          </td>
          <td className="px-4 py-3">
            <p className="font-body font-medium text-gf-dark capitalize">{task.task_type?.replace(/_/g, ' ')}</p>
            {task.notes && <p className="text-xs text-gray-400 truncate max-w-[150px]">{task.notes}</p>}
          </td>
          <td className="px-4 py-3"><Badge value={task.status} /></td>
          <td className="px-4 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">{task.scheduled_date || '—'}</td>
          <td className="px-4 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">{task.planned_end_date || '—'}</td>
          <td className="px-4 py-3 text-gray-500 font-body text-xs hidden lg:table-cell">{task.actual_start_date || '—'}</td>
          <td className="px-4 py-3 text-gray-500 font-body text-xs hidden lg:table-cell">{task.actual_end_date || '—'}</td>
          <td className="px-4 py-3 hidden md:table-cell">
            <DelayBadge delayDays={task.delay_days} status={task.status} plannedEndDate={task.planned_end_date} />
          </td>
          {!isAdmin && (
            <td className="px-4 py-3">
              <select
                value={task.status}
                disabled={updatingId === task.id || task.status === 'completed' || task.status === 'cancelled'}
                onChange={e => onStatusChange(task.id, e.target.value)}
                className="border border-gray-200 rounded-lg text-xs font-body px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gf-mid disabled:opacity-50"
              >
                {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>)}
              </select>
            </td>
          )}
        </tr>
      ))}
    </>
  )
}

function CreateTaskModal({ onClose, onCreated }) {
  const [farms, setFarms] = useState([])
  const [workers, setWorkers] = useState([])
  const [form, setForm] = useState({
    farm_id: '', assigned_to: '', task_type: 'inspection', priority: 'medium',
    scheduled_date: '', planned_end_date: '', notes: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getFarms(1, 100).then(r => setFarms(r.data || []))
    getUsers(1, 100).then(res => {
      const list = res.data || []
      setWorkers(list.filter(u => ['field_team', 'farm_worker'].includes(u.role) && u.is_active))
    }).catch(() => {})
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
        priority: form.priority,
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Task Type *</label>
              <select required value={form.task_type} onChange={e => set('task_type', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
                {TASK_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Assign To</label>
            <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid">
              <option value="">-- Unassigned --</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.role.replace('_', ' ')})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Planned Start Date</label>
              <input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Planned End Date</label>
              <input type="date" value={form.planned_end_date} onChange={e => set('planned_end_date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
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
