import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  getMyTasks, getCustomerTasks, getServiceRequests,
  createTask, createServiceRequest, updateTask, updateTaskStatus, deleteTask,
} from '../../api/tasks'
import { getFarms } from '../../api/farms'
import { getUsers } from '../../api/users'
import Badge from '../../components/dashboard/Badge'
import Pagination from '../../components/dashboard/Pagination'

const TASK_TYPES = ['irrigation', 'fertilization', 'pest_control', 'harvesting', 'inspection', 'soil_test', 'other']
const SERVICE_TYPES = ['irrigation', 'fertilization', 'pest_control', 'harvesting', 'inspection']
const STATUSES   = ['pending', 'in_progress', 'completed', 'cancelled']
const FIELD_STATUSES = ['pending', 'in_progress', 'completed']

const PRIORITY_STYLE = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-gray-100 text-gray-600',
}

const STATUS_LABEL = {
  requested:   'Requested',
  pending:     'Pending',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

function DelayBadge({ delayDays, status, plannedEndDate }) {
  if (status === 'cancelled' || status === 'requested') return null
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
  const role = user.role

  if (role === 'admin') return <AdminTasks />
  if (role === 'field_team') return <FieldTeamTasks />
  return <CustomerTasks />
}

/* ─── Admin: full task management ─── */
function AdminTasks() {
  const [tab, setTab] = useState('tasks') // 'tasks' | 'requests'
  const [tasks, setTasks] = useState([])
  const [requests, setRequests] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('planned_end_date')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editTask, setEditTask] = useState(null)

  const loadTasks = (p = 1, sort = sortBy, sf = statusFilter) => {
    setLoading(true)
    getMyTasks(p, 20, sort, sf || null).then(res => {
      setTasks(res.data || [])
      setTotal(res.total || 0)
      setPages(res.pages || 1)
      setPage(res.page || p)
    }).finally(() => setLoading(false))
  }

  const loadRequests = () => {
    setLoading(true)
    getServiceRequests(1, 50).then(res => {
      setRequests(res.data || [])
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (tab === 'tasks') loadTasks(1, sortBy, statusFilter)
    else loadRequests()
  }, [tab, sortBy, statusFilter])

  const handleCancel = async (taskId) => {
    if (!confirm('Cancel this task?')) return
    try {
      await updateTask(taskId, { status: 'cancelled' })
      loadTasks(page)
    } catch {}
  }

  const handleDelete = async (taskId) => {
    if (!confirm('Permanently delete this task?')) return
    try {
      await deleteTask(taskId)
      loadTasks(1)
    } catch {}
  }

  const handleAssign = async (requestId, payload) => {
    await updateTask(requestId, { ...payload, status: 'pending' })
    loadRequests()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gf-dark">Task Management</h1>
          <p className="text-gray-500 text-sm font-body">{total} tasks</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-light transition-colors">
          + Create Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[['tasks', 'All Tasks'], ['requests', 'Service Requests']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-heading font-semibold transition-colors ${tab === key ? 'bg-white text-gf-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}{key === 'requests' && requests.length > 0 ? ` (${requests.length})` : ''}
          </button>
        ))}
      </div>

      {tab === 'tasks' && (
        <>
          {/* Controls */}
          <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-body text-gray-500">Sort by</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-body focus:outline-none bg-white">
                <option value="planned_end_date">Plan End Date</option>
                <option value="planned_start_date">Plan Start Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="w-px h-4 bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <label className="text-xs font-body text-gray-500">Filter</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-body focus:outline-none bg-white">
                <option value="">All statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
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
                        <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Assigned To</th>
                        <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan Start</th>
                        <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan End</th>
                        <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Actual Start</th>
                        <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Actual End</th>
                        <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Delay</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tasks.map(task => (
                        <tr key={task.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            {task.priority && (
                              <span className={`text-xs font-heading font-semibold px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLE[task.priority] || ''}`}>
                                {task.priority}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-body font-medium text-gf-dark">{task.task_name || task.task_type?.replace(/_/g, ' ')}</p>
                            {task.task_name && <p className="text-xs text-gray-400 capitalize">{task.task_type?.replace(/_/g, ' ')}</p>}
                            {task.notes && !task.task_name && <p className="text-xs text-gray-400 truncate max-w-[140px]">{task.notes}</p>}
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-body text-xs hidden md:table-cell">
                            {task.assigned_to ? task.assigned_to.slice(0, 8) + '…' : <span className="text-amber-600">Unassigned</span>}
                          </td>
                          <td className="px-4 py-3"><Badge value={task.status} /></td>
                          <td className="px-4 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">{task.planned_start_date || task.scheduled_date || '—'}</td>
                          <td className="px-4 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">{task.planned_end_date || '—'}</td>
                          <td className="px-4 py-3 text-gray-500 font-body text-xs hidden lg:table-cell">{task.actual_start_date || '—'}</td>
                          <td className="px-4 py-3 text-gray-500 font-body text-xs hidden lg:table-cell">{task.actual_end_date || '—'}</td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <DelayBadge delayDays={task.delay_days} status={task.status} plannedEndDate={task.planned_end_date} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => setEditTask(task)} className="text-xs text-blue-600 hover:text-blue-800 font-body px-2 py-1 rounded hover:bg-blue-50">Edit</button>
                              {task.status !== 'cancelled' && task.status !== 'completed' && (
                                <button onClick={() => handleCancel(task.id)} className="text-xs text-red-500 hover:text-red-700 font-body px-2 py-1 rounded hover:bg-red-50">Cancel</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-4 border-t border-gray-100">
                  <Pagination page={page} pages={pages} onPage={p => loadTasks(p)} />
                </div>
              </>
            )}
          </div>
        </>
      )}

      {tab === 'requests' && (
        <ServiceRequestsTable requests={requests} loading={loading} onAssign={handleAssign} onRefresh={loadRequests} />
      )}

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadTasks(1) }} />}
      {editTask && <EditTaskModal task={editTask} onClose={() => setEditTask(null)} onSaved={() => { setEditTask(null); loadTasks(page) }} />}
    </div>
  )
}

function ServiceRequestsTable({ requests, loading, onAssign, onRefresh }) {
  const [assigningId, setAssigningId] = useState(null)

  if (loading) return <div className="py-16 text-center text-gray-400 font-body">Loading…</div>
  if (requests.length === 0) return <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400 font-body">No service requests.</div>

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Service</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Notes</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Requested On</th>
              <th className="px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="font-body font-medium text-gf-dark capitalize">{r.task_type?.replace(/_/g, ' ')}</p>
                  <Badge value="requested" />
                </td>
                <td className="px-4 py-3 text-gray-500 font-body text-xs hidden md:table-cell max-w-[200px] truncate">{r.notes || '—'}</td>
                <td className="px-4 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  {assigningId === r.id
                    ? <AssignInline taskId={r.id} taskType={r.task_type} onAssign={async (p) => { await onAssign(r.id, p); setAssigningId(null); onRefresh() }} onCancel={() => setAssigningId(null)} />
                    : <button onClick={() => setAssigningId(r.id)} className="text-xs bg-gf-mid text-white px-3 py-1.5 rounded-lg hover:bg-gf-dark font-body font-semibold">Assign →</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AssignInline({ taskId, taskType, onAssign, onCancel }) {
  const [workers, setWorkers] = useState([])
  const [form, setForm] = useState({ assigned_to: '', planned_start_date: '', planned_end_date: '', priority: 'medium' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getUsers(1, 100).then(res => setWorkers((res.data || []).filter(u => u.role === 'field_team' && u.is_active))).catch(() => {})
  }, [])

  const submit = async () => {
    setSaving(true)
    try {
      await onAssign({
        task_name: taskType.replace(/_/g, ' '),
        assigned_to: form.assigned_to || null,
        planned_start_date: form.planned_start_date || null,
        planned_end_date: form.planned_end_date || null,
        priority: form.priority,
      })
    } finally { setSaving(false) }
  }

  return (
    <div className="flex flex-wrap gap-2 justify-end items-center">
      <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
        className="border border-gray-300 rounded-lg px-2 py-1 text-xs font-body focus:outline-none focus:ring-1 focus:ring-gf-mid bg-white">
        <option value="">-- Field Team --</option>
        {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>
      <input type="date" placeholder="Start" value={form.planned_start_date} onChange={e => setForm(f => ({ ...f, planned_start_date: e.target.value }))}
        className="border border-gray-300 rounded-lg px-2 py-1 text-xs font-body focus:outline-none focus:ring-1 focus:ring-gf-mid w-32" />
      <input type="date" placeholder="End" value={form.planned_end_date} onChange={e => setForm(f => ({ ...f, planned_end_date: e.target.value }))}
        className="border border-gray-300 rounded-lg px-2 py-1 text-xs font-body focus:outline-none focus:ring-1 focus:ring-gf-mid w-32" />
      <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
        className="border border-gray-300 rounded-lg px-2 py-1 text-xs font-body focus:outline-none focus:ring-1 focus:ring-gf-mid bg-white">
        <option value="high">🔴 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>
      <button onClick={submit} disabled={saving} className="text-xs bg-gf-mid text-white px-3 py-1.5 rounded-lg hover:bg-gf-dark font-body font-semibold disabled:opacity-60">
        {saving ? '…' : 'Confirm'}
      </button>
      <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700 font-body">Cancel</button>
    </div>
  )
}

/* ─── Field Team: view + update status ─── */
function FieldTeamTasks() {
  const [tasks, setTasks] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const load = (p = 1, sf = statusFilter) => {
    setLoading(true)
    getMyTasks(p, 20, 'planned_end_date', sf || null).then(res => {
      setTasks(res.data || [])
      setTotal(res.total || 0)
      setPages(res.pages || 1)
      setPage(res.page || p)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load(1, statusFilter) }, [statusFilter])

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId)
    try {
      const updated = await updateTaskStatus(taskId, { status: newStatus })
      setTasks(ts => ts.map(t => t.id === taskId ? { ...t, ...updated } : t))
    } catch {}
    setUpdatingId(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gf-dark">My Assigned Tasks</h1>
          <p className="text-gray-500 text-sm font-body">{total} tasks assigned to you</p>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
          <option value="">All Statuses</option>
          {FIELD_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
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
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Priority</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Task</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan Start</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan End</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Actual Start</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Actual End</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Delay</th>
                    <th className="px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        {task.priority && (
                          <span className={`text-xs font-heading font-semibold px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLE[task.priority] || ''}`}>
                            {task.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-body font-medium text-gf-dark">{task.task_name || task.task_type?.replace(/_/g, ' ')}</p>
                        {task.notes && <p className="text-xs text-gray-400 truncate max-w-[150px]">{task.notes}</p>}
                      </td>
                      <td className="px-4 py-3"><Badge value={task.status} /></td>
                      <td className="px-4 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">{task.planned_start_date || task.scheduled_date || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">{task.planned_end_date || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 font-body text-xs hidden lg:table-cell">{task.actual_start_date || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 font-body text-xs hidden lg:table-cell">{task.actual_end_date || '—'}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <DelayBadge delayDays={task.delay_days} status={task.status} plannedEndDate={task.planned_end_date} />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={task.status}
                          disabled={updatingId === task.id || task.status === 'completed' || task.status === 'cancelled'}
                          onChange={e => handleStatusChange(task.id, e.target.value)}
                          className="border border-gray-200 rounded-lg text-xs font-body px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gf-mid disabled:opacity-50 bg-white"
                        >
                          {FIELD_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                        </select>
                      </td>
                    </tr>
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
    </div>
  )
}

/* ─── Customer: view service requests + submit new ─── */
function CustomerTasks() {
  const [tasks, setTasks] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showRequest, setShowRequest] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const load = (sf = statusFilter) => {
    setLoading(true)
    getCustomerTasks(1, 50, sf || null).then(res => {
      setTasks(res.data || [])
      setTotal(res.total || 0)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load(statusFilter) }, [statusFilter])

  const ALL_STATUSES = ['requested', 'pending', 'in_progress', 'completed', 'cancelled']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gf-dark">My Farm Services</h1>
          <p className="text-gray-500 text-sm font-body">{total} service requests & tasks</p>
        </div>
        <button onClick={() => setShowRequest(true)} className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-light transition-colors">
          + Request Service
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-body text-gray-500">Filter</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-body focus:outline-none bg-white">
          <option value="">All</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 font-body">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 font-body mb-4">No service requests yet.</p>
            <button onClick={() => setShowRequest(true)} className="bg-gf-mid text-white font-heading font-semibold px-5 py-2 rounded-lg text-sm hover:bg-gf-light">
              Request Your First Service
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Service</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan Start</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan End</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Requested On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <p className="font-body font-medium text-gf-dark capitalize">
                      {task.task_name || task.task_type?.replace(/_/g, ' ')}
                    </p>
                    {task.notes && task.notes !== task.task_name && (
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{task.notes}</p>
                    )}
                  </td>
                  <td className="px-5 py-3"><Badge value={task.status} /></td>
                  <td className="px-5 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">{task.planned_start_date || '—'}</td>
                  <td className="px-5 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">{task.planned_end_date || '—'}</td>
                  <td className="px-5 py-3 text-gray-500 font-body text-xs hidden md:table-cell">
                    {task.created_at ? new Date(task.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showRequest && <ServiceRequestModal onClose={() => setShowRequest(false)} onCreated={() => { setShowRequest(false); load() }} />}
    </div>
  )
}

/* ─── Modals ─── */
function CreateTaskModal({ onClose, onCreated }) {
  const [farms, setFarms] = useState([])
  const [workers, setWorkers] = useState([])
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({
    task_name: '', farm_id: '', customer_id: '', assigned_to: '',
    task_type: 'inspection', priority: 'medium',
    planned_start_date: '', planned_end_date: '', notes: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getFarms(1, 100).then(r => setFarms(r.data || []))
    getUsers(1, 200).then(res => {
      const list = res.data || []
      setWorkers(list.filter(u => u.role === 'field_team' && u.is_active))
      setCustomers(list.filter(u => u.role === 'customer' && u.is_active))
    }).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await createTask({
        task_name: form.task_name || null,
        farm_id: form.farm_id,
        customer_id: form.customer_id || null,
        assigned_to: form.assigned_to || null,
        task_type: form.task_type,
        priority: form.priority,
        planned_start_date: form.planned_start_date || null,
        planned_end_date: form.planned_end_date || null,
        notes: form.notes || null,
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-heading font-bold text-gf-dark">Create Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Task Name</label>
            <input value={form.task_name} onChange={e => set('task_name', e.target.value)}
              placeholder="e.g. Paddy field irrigation — season 2"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Task Type *</label>
              <select required value={form.task_type} onChange={e => set('task_type', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
                {TASK_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Farm *</label>
            <select required value={form.farm_id} onChange={e => set('farm_id', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
              <option value="">Select farm</option>
              {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Customer</label>
            <select value={form.customer_id} onChange={e => set('customer_id', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
              <option value="">-- Select customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Assign to Field Team</label>
            <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
              <option value="">-- Unassigned --</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Planned Start Date</label>
              <input type="date" value={form.planned_start_date} onChange={e => set('planned_start_date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
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

function EditTaskModal({ task, onClose, onSaved }) {
  const [farms, setFarms] = useState([])
  const [workers, setWorkers] = useState([])
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({
    task_name: task.task_name || '',
    task_type: task.task_type || 'inspection',
    assigned_to: task.assigned_to || '',
    customer_id: task.customer_id || '',
    priority: task.priority || 'medium',
    planned_start_date: task.planned_start_date || task.scheduled_date || '',
    planned_end_date: task.planned_end_date || '',
    notes: task.notes || '',
    status: task.status || 'pending',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getFarms(1, 100).then(r => setFarms(r.data || []))
    getUsers(1, 200).then(res => {
      const list = res.data || []
      setWorkers(list.filter(u => u.role === 'field_team' && u.is_active))
      setCustomers(list.filter(u => u.role === 'customer' && u.is_active))
    }).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await updateTask(task.id, {
        task_name: form.task_name || null,
        task_type: form.task_type,
        assigned_to: form.assigned_to || null,
        customer_id: form.customer_id || null,
        priority: form.priority,
        planned_start_date: form.planned_start_date || null,
        planned_end_date: form.planned_end_date || null,
        notes: form.notes || null,
        status: form.status,
      })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update task')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-heading font-bold text-gf-dark">Edit Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Task Name</label>
            <input value={form.task_name} onChange={e => set('task_name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Task Type</label>
              <select value={form.task_type} onChange={e => set('task_type', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
                {TASK_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Customer</label>
            <select value={form.customer_id} onChange={e => set('customer_id', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
              <option value="">-- Select customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Assigned Field Team Member</label>
            <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
              <option value="">-- Unassigned --</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Planned Start</label>
              <input type="date" value={form.planned_start_date} onChange={e => set('planned_start_date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Planned End</label>
              <input type="date" value={form.planned_end_date} onChange={e => set('planned_end_date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
              {[...STATUSES, 'requested'].map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-light disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ServiceRequestModal({ onClose, onCreated }) {
  const [farms, setFarms] = useState([])
  const [form, setForm] = useState({ farm_id: '', task_type: 'irrigation', notes: '', planned_start_date: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getFarms(1, 100).then(r => setFarms(r.data || []))
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async e => {
    e.preventDefault()
    if (!form.farm_id) { setError('Please select a farm'); return }
    setSaving(true); setError('')
    try {
      await createServiceRequest({
        farm_id: form.farm_id,
        task_type: form.task_type,
        notes: form.notes || null,
        planned_start_date: form.planned_start_date || null,
      })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit request')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-heading font-bold text-gf-dark">Request a Service</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Farm *</label>
            <select required value={form.farm_id} onChange={e => set('farm_id', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
              <option value="">Select your farm</option>
              {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Service Type *</label>
            <select value={form.task_type} onChange={e => set('task_type', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
              {SERVICE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Preferred Date</label>
            <input type="date" value={form.planned_start_date} onChange={e => set('planned_start_date', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Additional Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              placeholder="Describe your requirement, e.g. 2 acres of paddy need irrigation"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid resize-none" />
          </div>

          <p className="text-xs text-gray-500 font-body bg-gray-50 rounded-lg px-3 py-2">
            Your request will be reviewed by our admin team and a field team member will be assigned.
          </p>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-light disabled:opacity-60">
              {saving ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
