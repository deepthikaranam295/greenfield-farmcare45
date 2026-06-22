import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getFarmSummary, getFarms } from '../../api/farms'
import { getMyTasks, getCustomerTasks } from '../../api/tasks'
import { getTaskPerformance } from '../../api/users'
import StatCard from '../../components/dashboard/StatCard'
import Badge from '../../components/dashboard/Badge'
import Pagination from '../../components/dashboard/Pagination'

const taskSerial = t => t.task_number ? `TASK-${String(t.task_number).padStart(3, '0')}` : '—'

export default function Overview() {
  const { user } = useAuth()
  if (user.role === 'admin')      return <AdminOverview />
  if (user.role === 'field_team') return <FieldTeamOverview />
  return <CustomerOverview />
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN OVERVIEW
═══════════════════════════════════════════════════════════════ */
function AdminOverview() {
  // Global stats
  const [perf, setPerf]             = useState(null)
  const [totalFarms, setTotalFarms] = useState(0)
  const [statsLoading, setStatsLoading] = useState(true)

  // Farm summary table
  const [farms, setFarms]             = useState([])
  const [farmTotal, setFarmTotal]     = useState(0)
  const [farmPage, setFarmPage]       = useState(1)
  const [farmPages, setFarmPages]     = useState(1)
  const [farmSearch, setFarmSearch]   = useState('')
  const [farmSearchQ, setFarmSearchQ] = useState('')
  const [farmSort, setFarmSort]       = useState('name')
  const [farmLoading, setFarmLoading] = useState(true)

  // Recent tasks table
  const [tasks, setTasks]           = useState([])
  const [taskTotal, setTaskTotal]   = useState(0)
  const [taskPage, setTaskPage]     = useState(1)
  const [taskPages, setTaskPages]   = useState(1)
  const [taskSearch, setTaskSearch] = useState('')
  const [taskSearchQ, setTaskSearchQ] = useState('')
  const [taskStatus, setTaskStatus] = useState('')
  const [taskLoading, setTaskLoading] = useState(true)

  // Load stats once
  useEffect(() => {
    Promise.all([
      getTaskPerformance().catch(() => null),
      getFarms(1, 1).catch(() => ({ total: 0 })),
    ]).then(([p, f]) => {
      setPerf(p)
      setTotalFarms(f.total || 0)
    }).finally(() => setStatsLoading(false))
  }, [])

  // Debounce farm search
  useEffect(() => {
    const t = setTimeout(() => { setFarmSearchQ(farmSearch); setFarmPage(1) }, 400)
    return () => clearTimeout(t)
  }, [farmSearch])

  // Debounce task search
  useEffect(() => {
    const t = setTimeout(() => { setTaskSearchQ(taskSearch); setTaskPage(1) }, 400)
    return () => clearTimeout(t)
  }, [taskSearch])

  const loadFarms = useCallback((p = 1) => {
    setFarmLoading(true)
    getFarmSummary(p, 10, farmSearchQ || null, farmSort)
      .then(r => {
        setFarms(r.data || [])
        setFarmTotal(r.total || 0)
        setFarmPages(r.pages || 1)
        setFarmPage(r.page || p)
      }).catch(err => console.error('Farm summary load failed:', err))
      .finally(() => setFarmLoading(false))
  }, [farmSearchQ, farmSort])

  const loadTasks = useCallback((p = 1) => {
    setTaskLoading(true)
    getMyTasks(p, 10, 'created_at', taskStatus || null, { search: taskSearchQ || null })
      .then(r => {
        setTasks(r.data || [])
        setTaskTotal(r.total || 0)
        setTaskPages(r.pages || 1)
        setTaskPage(r.page || p)
      }).catch(err => console.error('Tasks load failed:', err))
      .finally(() => setTaskLoading(false))
  }, [taskSearchQ, taskStatus])

  useEffect(() => { loadFarms(1) }, [loadFarms])
  useEffect(() => { loadTasks(1) }, [loadTasks])

  const today = new Date(); today.setHours(0,0,0,0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-gf-dark">Dashboard</h1>
        <p className="text-gray-500 text-sm font-body mt-0.5">Admin overview — manage farms, tasks, and field team.</p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon="🌾" label="Total Farms"   value={statsLoading ? '…' : totalFarms}             color="green" />
        <StatCard icon="📋" label="Total Tasks"   value={statsLoading ? '…' : (perf?.total ?? '…')}   color="gray" />
        <StatCard icon="⏳" label="Pending"       value={statsLoading ? '…' : (perf?.pending ?? '…')} color="amber" />
        <StatCard icon="🔄" label="In Progress"   value={statsLoading ? '…' : (perf?.in_progress ?? '…')} color="blue" />
        <StatCard icon="✅" label="Completed"     value={statsLoading ? '…' : (perf?.completed ?? '…')} color="green" />
        <StatCard icon="🚨" label="Overdue"       value={statsLoading ? '…' : (perf?.overdue ?? '…')} color="red" />
      </div>

      {/* ── Overdue / Due Soon alerts ── */}
      {perf && (perf.overdue > 0 || perf.due_soon > 0) && (
        <div className="flex flex-col sm:flex-row gap-2">
          {perf.overdue > 0 && (
            <div className="flex-1 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <span className="text-xl shrink-0">🚨</span>
              <div>
                <p className="text-sm font-heading font-semibold text-red-700">{perf.overdue} overdue task{perf.overdue !== 1 ? 's' : ''}</p>
                <p className="text-xs text-red-600 font-body">Planned end date has passed</p>
              </div>
              <Link to="/dashboard/tasks" className="ml-auto text-xs text-red-600 hover:text-red-800 font-body font-semibold shrink-0">View →</Link>
            </div>
          )}
          {perf.due_soon > 0 && (
            <div className="flex-1 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-xl shrink-0">⏰</span>
              <div>
                <p className="text-sm font-heading font-semibold text-amber-700">{perf.due_soon} task{perf.due_soon !== 1 ? 's' : ''} due within 3 days</p>
                <p className="text-xs text-amber-600 font-body">Review and assign field team</p>
              </div>
              <Link to="/dashboard/tasks" className="ml-auto text-xs text-amber-600 hover:text-amber-800 font-body font-semibold shrink-0">View →</Link>
            </div>
          )}
        </div>
      )}

      {/* ── Farm Summary Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div>
            <h2 className="font-heading font-semibold text-gf-dark">Farm Summary</h2>
            <p className="text-xs text-gray-400 font-body">{farmTotal} farms total</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              <input
                value={farmSearch}
                onChange={e => setFarmSearch(e.target.value)}
                placeholder="Search farms…"
                className="pl-6 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-gf-mid w-44"
              />
            </div>
            <select value={farmSort} onChange={e => { setFarmSort(e.target.value); setFarmPage(1) }}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-body focus:outline-none bg-white">
              <option value="name">Sort: Name</option>
              <option value="customer">Sort: Customer</option>
              <option value="status">Sort: Status</option>
            </select>
            <Link to="/dashboard/farms" className="text-xs text-gf-mid hover:underline font-body">View all →</Link>
          </div>
        </div>

        {farmLoading ? (
          <div className="py-12 text-center text-gray-400 font-body">Loading…</div>
        ) : farms.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-body">
            {farmSearch ? 'No farms match your search.' : 'No farms yet.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Farm</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Active Tasks</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Pending</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Last Activity</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {farms.map(f => (
                    <tr key={f.id} className="hover:bg-gf-pale/20 transition-colors">
                      <td className="px-5 py-3">
                        <Link to={`/dashboard/farms/${f.id}`}
                          className="font-body font-semibold text-gf-dark hover:text-gf-mid leading-tight block">
                          {f.name}
                        </Link>
                        {f.district && <p className="text-xs text-gray-400 font-body">{f.district}</p>}
                      </td>
                      <td className="px-5 py-3 text-sm font-body text-gray-700 hidden md:table-cell">
                        {f.customer_name !== '—' ? f.customer_name : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        {f.active_tasks > 0
                          ? <span className="text-sm font-heading font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{f.active_tasks}</span>
                          : <span className="text-sm text-gray-400 font-body">0</span>
                        }
                      </td>
                      <td className="px-5 py-3 hidden lg:table-cell">
                        {f.pending_tasks > 0
                          ? <span className="text-sm font-heading font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{f.pending_tasks}</span>
                          : <span className="text-sm text-gray-400 font-body">0</span>
                        }
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 font-body hidden lg:table-cell">
                        {f.last_activity ? new Date(f.last_activity).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}) : '—'}
                      </td>
                      <td className="px-5 py-3"><Badge value={f.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100">
              <Pagination page={farmPage} pages={farmPages} onPage={p => { setFarmPage(p); loadFarms(p) }} />
            </div>
          </>
        )}
      </div>

      {/* ── Recent Tasks Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-wrap gap-3">
          <div>
            <h2 className="font-heading font-semibold text-gf-dark">Recent Tasks</h2>
            <p className="text-xs text-gray-400 font-body">{taskTotal} tasks{taskStatus ? ' (filtered)' : ''}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              <input
                value={taskSearch}
                onChange={e => setTaskSearch(e.target.value)}
                placeholder="Search tasks…"
                className="pl-6 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-gf-mid w-44"
              />
            </div>
            <select value={taskStatus} onChange={e => { setTaskStatus(e.target.value); setTaskPage(1) }}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-body focus:outline-none bg-white">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Link to="/dashboard/tasks" className="text-xs text-gf-mid hover:underline font-body">View all →</Link>
          </div>
        </div>

        {taskLoading ? (
          <div className="py-12 text-center text-gray-400 font-body">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-body">No tasks found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide whitespace-nowrap">Task ID</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Task Name</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden lg:table-cell">Farm</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Customer</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Assigned To</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell whitespace-nowrap">Plan End</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tasks.map(task => {
                    const isOverdue = !['completed','cancelled','requested'].includes(task.status)
                      && task.planned_end_date
                      && new Date(task.planned_end_date) < today
                    return (
                      <tr key={task.id} className={`hover:bg-gray-50/50 transition-colors ${isOverdue ? 'bg-red-50/30' : ''}`}>
                        <td className="px-5 py-3 text-xs text-gray-400 font-body font-mono whitespace-nowrap">{taskSerial(task)}</td>
                        <td className="px-5 py-3">
                          <p className="font-body font-medium text-gf-dark leading-tight capitalize">
                            {task.task_name || task.task_type?.replace(/_/g,' ')}
                          </p>
                          {task.task_name && (
                            <p className="text-xs text-gray-400 capitalize">{task.task_type?.replace(/_/g,' ')}</p>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-600 font-body hidden lg:table-cell">{task.farm_name || '—'}</td>
                        <td className="px-5 py-3 text-xs text-gray-600 font-body hidden md:table-cell">{task.customer_name || '—'}</td>
                        <td className="px-5 py-3 text-xs font-body hidden md:table-cell">
                          {task.assigned_field_team_name
                            ? <span className="text-gray-700">{task.assigned_field_team_name}</span>
                            : <span className="text-amber-600 font-semibold">Unassigned</span>}
                        </td>
                        <td className="px-5 py-3"><Badge value={task.status} /></td>
                        <td className={`px-5 py-3 text-xs font-body hidden sm:table-cell ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                          {task.planned_end_date || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-gray-100">
              <Pagination page={taskPage} pages={taskPages} onPage={p => { setTaskPage(p); loadTasks(p) }} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FIELD TEAM OVERVIEW
═══════════════════════════════════════════════════════════════ */
function FieldTeamOverview() {
  const { user } = useAuth()
  const [tasks, setTasks]   = useState([])
  const [perf, setPerf]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const today = new Date(); today.setHours(0,0,0,0)

  useEffect(() => {
    Promise.all([
      getMyTasks(1, 50).catch(() => ({ data: [] })),
      getTaskPerformance().catch(() => null),
    ]).then(([t, p]) => {
      setTasks(t.data || [])
      setPerf(p)
    }).finally(() => setLoading(false))
  }, [])

  const displayed = statusFilter ? tasks.filter(t => t.status === statusFilter) : tasks.slice(0, 8)
  const overdue = tasks.filter(t =>
    !['completed','cancelled'].includes(t.status) && t.planned_end_date && new Date(t.planned_end_date) < today
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-gf-dark">Good {greeting()}, {user.name.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm font-body mt-0.5">Your assigned tasks and progress for today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📋" label="Assigned"    value={loading ? '…' : tasks.length}                       color="gray" />
        <StatCard icon="🔄" label="In Progress" value={loading ? '…' : tasks.filter(t => t.status === 'in_progress').length} color="blue" />
        <StatCard icon="✅" label="Completed"   value={loading ? '…' : (perf?.completed ?? '…')}           color="green" />
        <StatCard icon="🚨" label="Overdue"     value={loading ? '…' : overdue.length}                      color="red" />
      </div>

      {overdue.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-xl">🚨</span>
          <p className="text-sm font-heading font-semibold text-red-700">
            {overdue.length} overdue task{overdue.length !== 1 ? 's' : ''} — {overdue.slice(0,2).map(t => t.task_name || t.task_type?.replace(/_/g,' ')).join(', ')}
            {overdue.length > 2 && ` +${overdue.length - 2} more`}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-heading font-semibold text-gf-dark">My Tasks</h2>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-body focus:outline-none bg-white">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <Link to="/dashboard/tasks" className="text-xs text-gf-mid hover:underline font-body">View all →</Link>
          </div>
        </div>
        {loading ? (
          <div className="py-12 text-center text-gray-400 font-body">Loading…</div>
        ) : displayed.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-body">No tasks assigned to you.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Task</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Farm</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayed.map(task => {
                const isOverdue = !['completed','cancelled'].includes(task.status) && task.planned_end_date && new Date(task.planned_end_date) < today
                return (
                  <tr key={task.id} className={`hover:bg-gray-50/50 ${isOverdue ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="font-body font-medium text-gf-dark capitalize leading-tight">
                        {task.task_name || task.task_type?.replace(/_/g,' ')}
                      </p>
                      <p className="text-xs text-gray-400">{taskSerial(task)}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600 font-body hidden md:table-cell">{task.farm_name || '—'}</td>
                    <td className="px-5 py-3"><Badge value={task.status} /></td>
                    <td className={`px-5 py-3 text-xs font-body hidden sm:table-cell ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                      {task.planned_end_date || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOMER OVERVIEW
═══════════════════════════════════════════════════════════════ */
function CustomerOverview() {
  const { user } = useAuth()
  const [tasks, setTasks]   = useState([])
  const [farms, setFarms]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCustomerTasks(1, 50).catch(() => ({ data: [] })),
      getFarms(1, 100).catch(() => ({ data: [] })),
    ]).then(([t, f]) => {
      setTasks(t.data || [])
      setFarms(f.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const active    = tasks.filter(t => ['requested','pending','in_progress'].includes(t.status))
  const completed = tasks.filter(t => t.status === 'completed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-gf-dark">Good {greeting()}, {user.name.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm font-body mt-0.5">Track your farm services and activities.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🌾" label="My Farms"      value={loading ? '…' : farms.length}     color="green" />
        <StatCard icon="🔄" label="Active"         value={loading ? '…' : active.length}    color="blue" />
        <StatCard icon="✅" label="Completed"      value={loading ? '…' : completed.length} color="green" />
        <StatCard icon="📋" label="All Requests"   value={loading ? '…' : tasks.length}     color="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-heading font-semibold text-gf-dark">My Service Requests</h2>
            <Link to="/dashboard/tasks" className="text-xs text-gf-mid hover:underline font-body">View all →</Link>
          </div>
          {loading ? (
            <div className="py-10 text-center text-gray-400 font-body">Loading…</div>
          ) : tasks.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-400 font-body mb-3">No service requests yet.</p>
              <Link to="/dashboard/tasks" className="text-sm text-gf-mid hover:underline font-body">Request a service →</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="text-left px-5 py-2 text-xs font-heading text-gray-500 uppercase tracking-wide">Service</th>
                <th className="text-left px-5 py-2 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Farm</th>
                <th className="text-left px-5 py-2 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {tasks.slice(0, 6).map(task => (
                  <tr key={task.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-body font-medium text-gf-dark capitalize">{task.task_name || task.task_type?.replace(/_/g,' ')}</p>
                      <p className="text-xs text-gray-400">{taskSerial(task)}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600 font-body hidden sm:table-cell">{task.farm_name || '—'}</td>
                    <td className="px-5 py-3"><Badge value={task.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Farms */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-heading font-semibold text-gf-dark">My Farms</h2>
            <Link to="/dashboard/farms" className="text-xs text-gf-mid hover:underline font-body">View all →</Link>
          </div>
          {loading ? (
            <div className="py-10 text-center text-gray-400 font-body">Loading…</div>
          ) : farms.length === 0 ? (
            <div className="py-10 text-center text-gray-400 font-body">No farms registered yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>
                <th className="text-left px-5 py-2 text-xs font-heading text-gray-500 uppercase tracking-wide">Farm</th>
                <th className="text-left px-5 py-2 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">District</th>
                <th className="text-left px-5 py-2 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {farms.slice(0, 6).map(farm => (
                  <tr key={farm.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <Link to={`/dashboard/farms/${farm.id}`}
                        className="font-body font-semibold text-gf-dark hover:text-gf-mid">
                        {farm.name}
                      </Link>
                      {farm.size_acres && <p className="text-xs text-gray-400">{farm.size_acres} acres</p>}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600 font-body hidden sm:table-cell">{farm.district || '—'}</td>
                    <td className="px-5 py-3"><Badge value={farm.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
