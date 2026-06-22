import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  getMyTasks, getCustomerTasks, getServiceRequests,
  createTask, createServiceRequest, updateTask, updateTaskStatus, deleteTask,
} from '../../api/tasks'
import { getFarms } from '../../api/farms'
import { getUsers } from '../../api/users'
import Badge from '../../components/dashboard/Badge'
import Pagination from '../../components/dashboard/Pagination'

const TASK_TYPES   = ['irrigation', 'fertilization', 'pest_control', 'harvesting', 'inspection', 'soil_test', 'other']
const SERVICE_TYPES = ['irrigation', 'fertilization', 'pest_control', 'harvesting', 'inspection']
const STATUSES     = ['pending', 'in_progress', 'completed', 'cancelled']
const FIELD_STATUSES = ['pending', 'in_progress', 'completed']
const PRIORITIES   = ['high', 'medium', 'low']

const STATUS_LABEL = {
  requested: 'Requested', pending: 'Pending', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled',
}
const PRIORITY_STYLE = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-gray-100 text-gray-600',
}

const taskSerial = t => t.task_number ? `TASK-${String(t.task_number).padStart(3, '0')}` : '—'

function DelayBadge({ delayDays, status, plannedEndDate }) {
  if (status === 'cancelled' || status === 'requested') return null
  if (status === 'completed' && delayDays != null) {
    if (delayDays <= 0) return <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">On time</span>
    return <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">+{delayDays}d late</span>
  }
  if (plannedEndDate && status !== 'completed') {
    const today = new Date(); today.setHours(0,0,0,0)
    const diff = Math.ceil((new Date(plannedEndDate) - today) / 864e5)
    if (diff < 0) return <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">Overdue</span>
    if (diff <= 3) return <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">Due {diff === 0 ? 'today' : `in ${diff}d`}</span>
  }
  return null
}

export default function Tasks() {
  const { user } = useAuth()
  if (user.role === 'admin')      return <AdminTasks />
  if (user.role === 'field_team') return <FieldTeamTasks />
  return <CustomerTasks />
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN TASKS
═══════════════════════════════════════════════════════════════ */
function AdminTasks() {
  const [tab, setTab] = useState('tasks')

  // Task list
  const [tasks, setTasks]   = useState([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [pages, setPages]   = useState(1)
  const [loading, setLoading] = useState(true)

  // Service requests
  const [requests, setRequests]     = useState([])
  const [reqLoading, setReqLoading] = useState(false)

  // Sort
  const [sortBy, setSortBy] = useState('planned_end_date')

  // Filter values
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch]           = useState('')       // debounced
  const [statusFilter, setStatusFilter]   = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [farmFilter, setFarmFilter]       = useState('')
  const [assignedFilter, setAssignedFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  // Filter dropdown options
  const [filterCustomers, setFilterCustomers] = useState([])
  const [filterFarms, setFilterFarms]         = useState([])
  const [filterWorkers, setFilterWorkers]     = useState([])

  // Modals
  const [showCreate, setShowCreate] = useState(false)
  const [editTask, setEditTask]     = useState(null)
  const [detailTask, setDetailTask] = useState(null)

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // Load filter dropdown options once
  useEffect(() => {
    getUsers(1, 100, 'customer')
      .then(r => setFilterCustomers((r.data || []).filter(u => u.is_active).sort((a,b) => a.name.localeCompare(b.name))))
      .catch(err => console.error('Filter customers load failed:', err))
    getUsers(1, 100, 'field_team')
      .then(r => setFilterWorkers((r.data || []).filter(u => u.is_active).sort((a,b) => a.name.localeCompare(b.name))))
      .catch(err => console.error('Filter workers load failed:', err))
  }, [])

  // Cascade: when customer filter changes, load that customer's farms
  useEffect(() => {
    setFarmFilter('')
    if (!customerFilter) { setFilterFarms([]); return }
    getFarms(1, 100, customerFilter)
      .then(r => setFilterFarms(r.data || []))
      .catch(() => setFilterFarms([]))
  }, [customerFilter])

  const loadTasks = useCallback((p = 1) => {
    setLoading(true)
    getMyTasks(p, 20, sortBy, statusFilter || null, {
      search: search || null,
      customerId: customerFilter || null,
      farmId: farmFilter || null,
      assignedTo: assignedFilter || null,
      priority: priorityFilter || null,
    }).then(res => {
      setTasks(res.data || [])
      setTotal(res.total || 0)
      setPages(res.pages || 1)
      setPage(res.page || p)
    }).catch(err => console.error('Load tasks failed:', err))
      .finally(() => setLoading(false))
  }, [sortBy, statusFilter, search, customerFilter, farmFilter, assignedFilter, priorityFilter])

  const loadRequests = useCallback(() => {
    setReqLoading(true)
    getServiceRequests(1, 50).then(res => setRequests(res.data || []))
      .catch(err => console.error('Load requests failed:', err))
      .finally(() => setReqLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'tasks') loadTasks(1)
    else loadRequests()
  }, [tab, loadTasks, loadRequests])

  const clearFilters = () => {
    setSearchInput(''); setSearch('')
    setStatusFilter(''); setCustomerFilter(''); setFarmFilter('')
    setAssignedFilter(''); setPriorityFilter('')
    setPage(1)
  }
  const hasFilters = search || statusFilter || customerFilter || farmFilter || assignedFilter || priorityFilter

  const handleCancel = async id => {
    if (!confirm('Cancel this task?')) return
    try { await updateTask(id, { status: 'cancelled' }); loadTasks(page) } catch {}
  }
  const handleDelete = async id => {
    if (!confirm('Permanently delete this task?')) return
    try { await deleteTask(id); loadTasks(1) } catch {}
  }
  const handleAssign = async (reqId, payload) => {
    await updateTask(reqId, { ...payload, status: 'pending' })
    loadRequests()
  }

  const sel = 'border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-body bg-white focus:outline-none focus:ring-2 focus:ring-gf-mid'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gf-dark">Task Management</h1>
          <p className="text-gray-500 text-sm font-body">{total} task{total !== 1 ? 's' : ''}{hasFilters ? ' (filtered)' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-dark transition-colors">
          + Create Task
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 space-y-3">
        {/* Search row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search task, customer, farm, assigned to…"
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid"
            />
            {searchInput && (
              <button onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-1">✕</button>
            )}
          </div>
          {hasFilters && (
            <button onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-700 font-body border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50">
              Clear filters
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-2">
          <select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} className={sel}>
            <option value="">All Customers</option>
            {filterCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select value={farmFilter} onChange={e => setFarmFilter(e.target.value)} className={sel} disabled={!customerFilter && filterFarms.length === 0}>
            <option value="">{customerFilter ? (filterFarms.length === 0 ? 'No farms' : 'All Farms') : 'All Farms'}</option>
            {filterFarms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>

          <select value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)} className={sel}>
            <option value="">All Field Team</option>
            {filterWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={sel}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>

          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className={sel}>
            <option value="">All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <div className="w-px h-6 bg-gray-200 self-center hidden sm:block" />

          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={sel}>
            <option value="planned_end_date">Sort: Plan End</option>
            <option value="planned_start_date">Sort: Plan Start</option>
            <option value="priority">Sort: Priority</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[['tasks', 'All Tasks'], ['requests', `Service Requests${requests.length > 0 ? ` (${requests.length})` : ''}`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-heading font-semibold transition-colors
              ${tab === key ? 'bg-white text-gf-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      {tab === 'tasks' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400 font-body">Loading…</div>
          ) : tasks.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-400 font-body mb-2">{hasFilters ? 'No tasks match your filters.' : 'No tasks yet.'}</p>
              {hasFilters && <button onClick={clearFilters} className="text-sm text-gf-mid hover:underline font-body">Clear filters</button>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide whitespace-nowrap">Task ID</th>
                      <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Task Name</th>
                      <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Customer</th>
                      <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Farm</th>
                      <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Assigned To</th>
                      <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Priority</th>
                      <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden xl:table-cell">Plan Start</th>
                      <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan End</th>
                      <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Delay</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tasks.map(task => (
                      <tr key={task.id}
                        onClick={() => setDetailTask(task)}
                        className="hover:bg-gf-pale/30 cursor-pointer transition-colors">
                        <td className="px-4 py-3 font-body text-xs text-gray-500 whitespace-nowrap">{taskSerial(task)}</td>
                        <td className="px-4 py-3">
                          <p className="font-body font-medium text-gf-dark leading-tight">
                            {task.task_name || task.task_type?.replace(/_/g,' ')}
                          </p>
                          {task.task_name && (
                            <p className="text-xs text-gray-400 capitalize">{task.task_type?.replace(/_/g,' ')}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-body text-gray-600 hidden md:table-cell">
                          {task.customer_name || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs font-body text-gray-600 hidden lg:table-cell">
                          {task.farm_name || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs font-body hidden md:table-cell">
                          {task.assigned_field_team_name
                            ? <span className="text-gray-700">{task.assigned_field_team_name}</span>
                            : <span className="text-amber-600 font-semibold">Unassigned</span>}
                        </td>
                        <td className="px-4 py-3"><Badge value={task.status} /></td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {task.priority && (
                            <span className={`text-xs font-heading font-semibold px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLE[task.priority]}`}>
                              {task.priority}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-body hidden xl:table-cell">{task.planned_start_date || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-body hidden sm:table-cell">{task.planned_end_date || '—'}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <DelayBadge delayDays={task.delay_days} status={task.status} plannedEndDate={task.planned_end_date} />
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1 justify-end">
                            <button onClick={() => setEditTask(task)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-body px-2 py-1 rounded hover:bg-blue-50">Edit</button>
                            {task.status !== 'cancelled' && task.status !== 'completed' && (
                              <button onClick={() => handleCancel(task.id)}
                                className="text-xs text-red-500 hover:text-red-700 font-body px-2 py-1 rounded hover:bg-red-50">Cancel</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 border-t border-gray-100">
                <Pagination page={page} pages={pages} onPage={p => { setPage(p); loadTasks(p) }} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Service Requests Tab */}
      {tab === 'requests' && (
        <ServiceRequestsTable
          requests={requests}
          loading={reqLoading}
          onAssign={handleAssign}
          onRefresh={loadRequests}
        />
      )}

      {/* Modals */}
      {showCreate && (
        <CreateTaskModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadTasks(1) }}
        />
      )}
      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSaved={() => { setEditTask(null); loadTasks(page) }}
        />
      )}
      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onEdit={t => { setDetailTask(null); setEditTask(t) }}
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SERVICE REQUESTS TABLE
═══════════════════════════════════════════════════════════════ */
function ServiceRequestsTable({ requests, loading, onAssign, onRefresh }) {
  const [assigningId, setAssigningId] = useState(null)

  if (loading) return <div className="py-16 text-center text-gray-400 font-body">Loading…</div>
  if (requests.length === 0) return (
    <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400 font-body">
      No pending service requests.
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">ID</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Service</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Farm</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Requested On</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Notes</th>
              <th className="px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map(r => (
              <tr key={r.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3 text-xs text-gray-400 font-body">{taskSerial(r)}</td>
                <td className="px-4 py-3">
                  <p className="font-body font-medium text-gf-dark capitalize">{r.task_type?.replace(/_/g,' ')}</p>
                  <Badge value="requested" />
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 font-body hidden md:table-cell">{r.customer_name || '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-600 font-body hidden md:table-cell">{r.farm_name || '—'}</td>
                <td className="px-4 py-3 text-xs text-gray-500 font-body hidden sm:table-cell">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 font-body hidden lg:table-cell max-w-[180px] truncate">{r.notes || '—'}</td>
                <td className="px-4 py-3 text-right">
                  {assigningId === r.id
                    ? <AssignInline
                        onAssign={async p => { await onAssign(r.id, p); setAssigningId(null); onRefresh() }}
                        onCancel={() => setAssigningId(null)}
                      />
                    : <button onClick={() => setAssigningId(r.id)}
                        className="text-xs bg-gf-mid text-white px-3 py-1.5 rounded-lg hover:bg-gf-dark font-body font-semibold">
                        Assign →
                      </button>
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

function AssignInline({ onAssign, onCancel }) {
  const [workers, setWorkers] = useState([])
  const [form, setForm] = useState({ assigned_to: '', planned_start_date: '', planned_end_date: '', priority: 'medium' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getUsers(1, 100, 'field_team')
      .then(r => setWorkers((r.data || []).filter(u => u.is_active)))
      .catch(err => console.error('Load field team failed:', err))
  }, [])

  const submit = async () => {
    setSaving(true)
    try {
      await onAssign({
        assigned_to: form.assigned_to || null,
        planned_start_date: form.planned_start_date || null,
        planned_end_date: form.planned_end_date || null,
        priority: form.priority,
      })
    } finally { setSaving(false) }
  }

  const inp = 'border border-gray-300 rounded-lg px-2 py-1 text-xs font-body focus:outline-none focus:ring-1 focus:ring-gf-mid bg-white'

  return (
    <div className="flex flex-wrap gap-2 justify-end items-center">
      <select value={form.assigned_to} onChange={e => setForm(f => ({...f, assigned_to: e.target.value}))} className={inp}>
        <option value="">— Field Team —</option>
        {workers.length === 0 && <option disabled>No field team found</option>}
        {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>
      <input type="date" value={form.planned_start_date} onChange={e => setForm(f => ({...f, planned_start_date: e.target.value}))} className={`${inp} w-32`} />
      <input type="date" value={form.planned_end_date} onChange={e => setForm(f => ({...f, planned_end_date: e.target.value}))} className={`${inp} w-32`} />
      <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))} className={inp}>
        <option value="high">🔴 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>
      <button onClick={submit} disabled={saving}
        className="text-xs bg-gf-mid text-white px-3 py-1.5 rounded-lg hover:bg-gf-dark font-body font-semibold disabled:opacity-60">
        {saving ? '…' : 'Confirm'}
      </button>
      <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700 font-body">Cancel</button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FIELD TEAM TASKS
═══════════════════════════════════════════════════════════════ */
function FieldTeamTasks() {
  const [tasks, setTasks]     = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [detailTask, setDetailTask] = useState(null)

  const load = (p = 1, sf = statusFilter) => {
    setLoading(true)
    getMyTasks(p, 20, 'planned_end_date', sf || null)
      .then(res => {
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
    } catch(err) {
      console.error('Status update failed:', err)
    }
    setUpdatingId(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-gf-dark">My Assigned Tasks</h1>
          <p className="text-gray-500 text-sm font-body">{total} tasks assigned to you</p>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
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
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Task</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Farm</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan End</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Actual Start</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Actual End</th>
                    <th className="text-left px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Delay</th>
                    <th className="px-4 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.map(task => (
                    <tr key={task.id}
                      onClick={() => setDetailTask(task)}
                      className="hover:bg-gf-pale/30 cursor-pointer transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 font-body">{taskSerial(task)}</td>
                      <td className="px-4 py-3">
                        <p className="font-body font-medium text-gf-dark">{task.task_name || task.task_type?.replace(/_/g,' ')}</p>
                        {task.priority && (
                          <span className={`text-xs font-heading font-semibold px-1.5 py-0.5 rounded-full capitalize ${PRIORITY_STYLE[task.priority]}`}>
                            {task.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 font-body hidden md:table-cell">{task.farm_name || '—'}</td>
                      <td className="px-4 py-3"><Badge value={task.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-body hidden sm:table-cell">{task.planned_end_date || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-body hidden lg:table-cell">{task.actual_start_date || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-body hidden lg:table-cell">{task.actual_end_date || '—'}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <DelayBadge delayDays={task.delay_days} status={task.status} plannedEndDate={task.planned_end_date} />
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
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

      {detailTask && <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOMER TASKS
═══════════════════════════════════════════════════════════════ */
function CustomerTasks() {
  const [tasks, setTasks]     = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [showRequest, setShowRequest] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [detailTask, setDetailTask] = useState(null)

  const load = (sf = statusFilter) => {
    setLoading(true)
    getCustomerTasks(1, 50, sf || null)
      .then(res => { setTasks(res.data || []); setTotal(res.total || 0) })
      .finally(() => setLoading(false))
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
        <button onClick={() => setShowRequest(true)}
          className="bg-gf-mid text-white font-heading font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gf-dark transition-colors">
          + Request Service
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-body text-gray-500">Filter</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-body focus:outline-none bg-white">
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
            <button onClick={() => setShowRequest(true)}
              className="bg-gf-mid text-white font-heading font-semibold px-5 py-2 rounded-lg text-sm hover:bg-gf-dark">
              Request Your First Service
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Service</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Farm</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan Start</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan End</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Requested On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasks.map(task => (
                <tr key={task.id}
                  onClick={() => setDetailTask(task)}
                  className="hover:bg-gf-pale/30 cursor-pointer transition-colors">
                  <td className="px-5 py-3 text-xs text-gray-400 font-body">{taskSerial(task)}</td>
                  <td className="px-5 py-3">
                    <p className="font-body font-medium text-gf-dark capitalize">
                      {task.task_name || task.task_type?.replace(/_/g,' ')}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 font-body hidden md:table-cell">{task.farm_name || '—'}</td>
                  <td className="px-5 py-3"><Badge value={task.status} /></td>
                  <td className="px-5 py-3 text-xs text-gray-500 font-body hidden sm:table-cell">{task.planned_start_date || '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-500 font-body hidden sm:table-cell">{task.planned_end_date || '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-500 font-body hidden md:table-cell">
                    {task.created_at ? new Date(task.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showRequest && <ServiceRequestModal onClose={() => setShowRequest(false)} onCreated={() => { setShowRequest(false); load() }} />}
      {detailTask && <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TASK DETAIL MODAL
═══════════════════════════════════════════════════════════════ */
function TaskDetailModal({ task, onClose, onEdit }) {
  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : null

  const timeline = [
    { label: 'Created',    date: task.created_at,        done: true },
    { label: 'Pending',    date: task.planned_start_date, done: ['pending','in_progress','completed','cancelled'].includes(task.status) },
    { label: 'In Progress',date: task.actual_start_date,  done: ['in_progress','completed'].includes(task.status) },
    { label: 'Completed',  date: task.actual_end_date,    done: task.status === 'completed' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-body font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">
                {taskSerial(task)}
              </span>
              <Badge value={task.status} />
              {task.priority && (
                <span className={`text-xs font-heading font-semibold px-2 py-0.5 rounded-full capitalize ${PRIORITY_STYLE[task.priority]}`}>
                  {task.priority}
                </span>
              )}
            </div>
            <h2 className="font-heading font-bold text-gf-dark text-lg mt-1 truncate">
              {task.task_name || task.task_type?.replace(/_/g,' ')}
            </h2>
            {task.task_name && (
              <p className="text-xs text-gray-400 capitalize mt-0.5">{task.task_type?.replace(/_/g,' ')}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            {onEdit && (
              <button onClick={() => onEdit(task)}
                className="text-xs text-blue-600 hover:text-blue-800 font-body border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                Edit
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Key info grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Customer" value={task.customer_name} />
            <InfoRow label="Farm" value={task.farm_name} />
            <InfoRow label="Assigned To"
              value={task.assigned_field_team_name
                ? <span className="text-gf-dark font-medium">{task.assigned_field_team_name}</span>
                : <span className="text-amber-600 font-semibold">Unassigned</span>} />
            <InfoRow label="Task Type" value={<span className="capitalize">{task.task_type?.replace(/_/g,' ')}</span>} />
          </div>

          {/* Dates grid */}
          <div>
            <h3 className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide mb-3">Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Planned Start"  value={fmtDate(task.planned_start_date)} />
              <InfoRow label="Planned End"    value={fmtDate(task.planned_end_date)} />
              <InfoRow label="Actual Start"   value={fmtDate(task.actual_start_date)} />
              <InfoRow label="Actual End"     value={fmtDate(task.actual_end_date)} />
            </div>
            {task.status === 'completed' && task.delay_days != null && (
              <div className="mt-3">
                <InfoRow label="Delay"
                  value={task.delay_days <= 0
                    ? <span className="text-green-700 font-semibold">Completed on time ({Math.abs(task.delay_days)}d early)</span>
                    : <span className="text-red-700 font-semibold">+{task.delay_days} days late</span>}
                />
              </div>
            )}
            {task.status !== 'completed' && task.planned_end_date && (
              <div className="mt-3">
                <DelayBadge delayDays={task.delay_days} status={task.status} plannedEndDate={task.planned_end_date} />
              </div>
            )}
          </div>

          {/* Notes */}
          {task.notes && (
            <div>
              <h3 className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</h3>
              <p className="text-sm font-body text-gray-700 bg-gray-50 rounded-xl px-4 py-3 whitespace-pre-wrap">{task.notes}</p>
            </div>
          )}

          {/* Activity Timeline */}
          <div>
            <h3 className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wide mb-3">Activity Timeline</h3>
            <div className="space-y-0">
              {timeline.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 border-2 ${step.done ? 'bg-gf-mid border-gf-mid' : 'bg-white border-gray-300'}`} />
                    {i < timeline.length - 1 && <div className="w-0.5 h-6 bg-gray-200 mt-0.5" />}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-body font-medium ${step.done ? 'text-gf-dark' : 'text-gray-400'}`}>{step.label}</p>
                    {step.date && (
                      <p className="text-xs text-gray-400 font-body">
                        {fmtDate(step.date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer meta */}
          <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-4 text-xs text-gray-400 font-body">
            <span>Created: {fmtDate(task.created_at)}</span>
            <span>Updated: {fmtDate(task.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-body font-medium uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-body text-gray-700">{value ?? <span className="text-gray-300">—</span>}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CREATE TASK MODAL
═══════════════════════════════════════════════════════════════ */
function CreateTaskModal({ onClose, onCreated }) {
  const [allFarms, setAllFarms]         = useState([])
  const [filteredFarms, setFilteredFarms] = useState([])
  const [workers, setWorkers]           = useState([])
  const [customers, setCustomers]       = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingWorkers, setLoadingWorkers]     = useState(true)
  const [loadingFarms, setLoadingFarms]         = useState(true)
  const [dropdownError, setDropdownError] = useState('')
  const [form, setForm] = useState({
    task_name: '', farm_id: '', customer_id: '', assigned_to: '',
    task_type: 'inspection', priority: 'medium',
    planned_start_date: '', planned_end_date: '', notes: '',
  })
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoadingCustomers(true)
    getUsers(1, 100, 'customer')
      .then(r => setCustomers((r.data||[]).filter(u=>u.is_active).sort((a,b)=>a.name.localeCompare(b.name))))
      .catch(err => { console.error('Load customers failed:', err); setDropdownError('Failed to load customers.') })
      .finally(() => setLoadingCustomers(false))

    setLoadingWorkers(true)
    getUsers(1, 100, 'field_team')
      .then(r => setWorkers((r.data||[]).filter(u=>u.is_active).sort((a,b)=>a.name.localeCompare(b.name))))
      .catch(err => { console.error('Load field team failed:', err); setDropdownError('Failed to load field team.') })
      .finally(() => setLoadingWorkers(false))

    setLoadingFarms(true)
    getFarms(1, 100)
      .then(r => { setAllFarms(r.data||[]); setFilteredFarms(r.data||[]) })
      .catch(err => { console.error('Load farms failed:', err); setDropdownError('Failed to load farms.') })
      .finally(() => setLoadingFarms(false))
  }, [])

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleCustomerChange = customerId => {
    set('customer_id', customerId)
    set('farm_id', '')
    if (!customerId) { setFilteredFarms(allFarms); return }
    setLoadingFarms(true)
    getFarms(1, 100, customerId)
      .then(r => setFilteredFarms(r.data||[]))
      .catch(() => setFilteredFarms([]))
      .finally(() => setLoadingFarms(false))
  }

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

  const sel = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white disabled:bg-gray-50 disabled:text-gray-400'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-heading font-bold text-gf-dark">Create Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          {dropdownError && <p className="text-amber-700 text-sm font-body bg-amber-50 px-3 py-2 rounded-lg">⚠ {dropdownError}</p>}

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Task Name</label>
            <input value={form.task_name} onChange={e => set('task_name', e.target.value)}
              placeholder="e.g. Paddy field irrigation — season 2"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Task Type *</label>
              <select required value={form.task_type} onChange={e => set('task_type', e.target.value)} className={sel}>
                {TASK_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className={sel}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Customer</label>
            <select value={form.customer_id} onChange={e => handleCustomerChange(e.target.value)}
              disabled={loadingCustomers} className={sel}>
              <option value="">{loadingCustomers ? 'Loading customers…' : customers.length === 0 ? 'No customers found' : '— Select customer —'}</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">
              Farm *{form.customer_id ? ' (customer farms only)' : ''}
            </label>
            <select required value={form.farm_id} onChange={e => set('farm_id', e.target.value)}
              disabled={loadingFarms} className={sel}>
              <option value="">
                {loadingFarms ? 'Loading farms…'
                  : filteredFarms.length === 0
                    ? (form.customer_id ? 'No farms found for this customer' : 'No farms found')
                    : 'Select farm'}
              </option>
              {filteredFarms.map(f => <option key={f.id} value={f.id}>{f.name}{f.district ? ` — ${f.district}` : ''}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Assign to Field Team</label>
            <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)}
              disabled={loadingWorkers} className={sel}>
              <option value="">{loadingWorkers ? 'Loading field team…' : workers.length === 0 ? 'No field team members found' : '— Unassigned —'}</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Planned Start Date</label>
              <input type="date" value={form.planned_start_date} onChange={e => set('planned_start_date', e.target.value)}
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
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              placeholder="Optional notes"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-dark disabled:opacity-60">
              {saving ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EDIT TASK MODAL
═══════════════════════════════════════════════════════════════ */
function EditTaskModal({ task, onClose, onSaved }) {
  const [workers, setWorkers]     = useState([])
  const [customers, setCustomers] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingWorkers, setLoadingWorkers]     = useState(true)
  const [form, setForm] = useState({
    task_name:          task.task_name || '',
    task_type:          task.task_type || 'inspection',
    assigned_to:        task.assigned_to || '',
    customer_id:        task.customer_id || '',
    priority:           task.priority || 'medium',
    planned_start_date: task.planned_start_date || task.scheduled_date || '',
    planned_end_date:   task.planned_end_date || '',
    notes:              task.notes || '',
    status:             task.status || 'pending',
  })
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoadingCustomers(true)
    getUsers(1, 100, 'customer')
      .then(r => setCustomers((r.data||[]).filter(u=>u.is_active).sort((a,b)=>a.name.localeCompare(b.name))))
      .catch(err => console.error('Load customers failed:', err))
      .finally(() => setLoadingCustomers(false))

    setLoadingWorkers(true)
    getUsers(1, 100, 'field_team')
      .then(r => setWorkers((r.data||[]).filter(u=>u.is_active).sort((a,b)=>a.name.localeCompare(b.name))))
      .catch(err => console.error('Load field team failed:', err))
      .finally(() => setLoadingWorkers(false))
  }, [])

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const submit = async e => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await updateTask(task.id, {
        task_name:          form.task_name || null,
        task_type:          form.task_type,
        assigned_to:        form.assigned_to || null,
        customer_id:        form.customer_id || null,
        priority:           form.priority,
        planned_start_date: form.planned_start_date || null,
        planned_end_date:   form.planned_end_date || null,
        notes:              form.notes || null,
        status:             form.status,
      })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update task')
    } finally { setSaving(false) }
  }

  const sel = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white disabled:bg-gray-50 disabled:text-gray-400'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="font-heading font-bold text-gf-dark">Edit Task</h2>
            <p className="text-xs text-gray-400 font-body">{taskSerial(task)} · {task.farm_name || 'Unknown farm'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
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
              <select value={form.task_type} onChange={e => set('task_type', e.target.value)} className={sel}>
                {TASK_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className={sel}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Customer</label>
            <select value={form.customer_id} onChange={e => set('customer_id', e.target.value)}
              disabled={loadingCustomers} className={sel}>
              <option value="">{loadingCustomers ? 'Loading…' : customers.length === 0 ? 'No customers found' : '— Select customer —'}</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Assigned Field Team Member</label>
            <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)}
              disabled={loadingWorkers} className={sel}>
              <option value="">{loadingWorkers ? 'Loading…' : workers.length === 0 ? 'No field team found' : '— Unassigned —'}</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Planned Start</label>
              <input type="date" value={form.planned_start_date} onChange={e => set('planned_start_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
            <div>
              <label className="block text-xs font-body font-medium text-gray-600 mb-1">Planned End</label>
              <input type="date" value={form.planned_end_date} onChange={e => set('planned_end_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={sel}>
              {[...STATUSES, 'requested'].map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid resize-none" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-dark disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SERVICE REQUEST MODAL (Customer)
═══════════════════════════════════════════════════════════════ */
function ServiceRequestModal({ onClose, onCreated }) {
  const [farms, setFarms]   = useState([])
  const [form, setForm]     = useState({ farm_id: '', task_type: 'irrigation', notes: '', planned_start_date: '' })
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { getFarms(1, 100).then(r => setFarms(r.data||[])) }, [])

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const submit = async e => {
    e.preventDefault()
    if (!form.farm_id) { setError('Please select a farm'); return }
    setSaving(true); setError('')
    try {
      await createServiceRequest({
        farm_id: form.farm_id, task_type: form.task_type,
        notes: form.notes || null, planned_start_date: form.planned_start_date || null,
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {error && <p className="text-red-600 text-sm font-body bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Farm *</label>
            <select required value={form.farm_id} onChange={e => set('farm_id', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
              <option value="">{farms.length === 0 ? 'No farms found — add a farm first' : 'Select your farm'}</option>
              {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Service Type *</label>
            <select value={form.task_type} onChange={e => set('task_type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid bg-white">
              {SERVICE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace(/_/g,' ')}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-body font-medium text-gray-600 mb-1">Preferred Date</label>
            <input type="date" value={form.planned_start_date} onChange={e => set('planned_start_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
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
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-gf-mid text-white font-heading font-semibold py-2 rounded-lg text-sm hover:bg-gf-dark disabled:opacity-60">
              {saving ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
