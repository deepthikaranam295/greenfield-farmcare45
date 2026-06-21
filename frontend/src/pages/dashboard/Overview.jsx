import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getFarms } from '../../api/farms'
import { getMyTasks } from '../../api/tasks'
import StatCard from '../../components/dashboard/StatCard'
import Badge from '../../components/dashboard/Badge'

export default function Overview() {
  const { user } = useAuth()
  const [farms, setFarms] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(null)

  useEffect(() => {
    Promise.all([
      getFarms(1, 100).catch(() => ({ data: [] })),
      user.role !== 'customer' ? getMyTasks(1, 100).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]).then(([f, t]) => {
      setFarms(f.data || [])
      setAllTasks(t.data || [])
    }).finally(() => setLoading(false))
  }, [user.role])

  const taskCounts = {
    pending:     allTasks.filter(t => t.status === 'pending').length,
    in_progress: allTasks.filter(t => t.status === 'in_progress').length,
    completed:   allTasks.filter(t => t.status === 'completed').length,
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const in3Days = new Date(today); in3Days.setDate(today.getDate() + 3)

  const activeTasks = allTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
  const overdueTasks = activeTasks.filter(t => t.planned_end_date && new Date(t.planned_end_date) < today)
  const dueSoonTasks = activeTasks.filter(t => {
    if (!t.planned_end_date) return false
    const d = new Date(t.planned_end_date)
    return d >= today && d <= in3Days
  })

  const displayedTasks = statusFilter
    ? allTasks.filter(t => t.status === statusFilter)
    : allTasks.slice(0, 5)

  const handleCardClick = (status) => {
    setStatusFilter(prev => prev === status ? null : status)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 font-body">Loading…</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-gf-dark">
          Good {greeting()}, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm font-body mt-0.5">Here's what's happening on your farms today.</p>
      </div>

      {/* Alerts */}
      {user.role !== 'customer' && (overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <div className="space-y-2">
          {overdueTasks.length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <span className="text-xl">🚨</span>
              <div className="flex-1">
                <p className="text-sm font-heading font-semibold text-red-700">
                  {overdueTasks.length} overdue {overdueTasks.length === 1 ? 'task' : 'tasks'}
                </p>
                <p className="text-xs text-red-600 font-body">
                  {overdueTasks.slice(0, 3).map(t => t.task_type?.replace(/_/g, ' ')).join(', ')}{overdueTasks.length > 3 ? ` +${overdueTasks.length - 3} more` : ''}
                </p>
              </div>
              <Link to="/dashboard/tasks" onClick={() => {}} className="text-xs text-red-600 hover:underline font-body shrink-0">View →</Link>
            </div>
          )}
          {dueSoonTasks.length > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-xl">⏰</span>
              <div className="flex-1">
                <p className="text-sm font-heading font-semibold text-amber-700">
                  {dueSoonTasks.length} {dueSoonTasks.length === 1 ? 'task' : 'tasks'} due in next 3 days
                </p>
                <p className="text-xs text-amber-600 font-body">
                  {dueSoonTasks.slice(0, 3).map(t => t.task_type?.replace(/_/g, ' ')).join(', ')}{dueSoonTasks.length > 3 ? ` +${dueSoonTasks.length - 3} more` : ''}
                </p>
              </div>
              <Link to="/dashboard/tasks" className="text-xs text-amber-600 hover:underline font-body shrink-0">View →</Link>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🌾" label="Total Farms" value={farms.length} color="green" />
        <StatCard
          icon="⏳" label="Pending" value={taskCounts.pending} color="amber"
          active={statusFilter === 'pending'}
          onClick={() => handleCardClick('pending')}
        />
        <StatCard
          icon="🔄" label="In Progress" value={taskCounts.in_progress} color="blue"
          active={statusFilter === 'in_progress'}
          onClick={() => handleCardClick('in_progress')}
        />
        <StatCard
          icon="✅" label="Completed" value={taskCounts.completed} color="green"
          active={statusFilter === 'completed'}
          onClick={() => handleCardClick('completed')}
        />
      </div>

      {/* Recent Farms */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-heading font-semibold text-gf-dark">Recent Farms</h2>
          <Link to="/dashboard/farms" className="text-xs text-gf-mid hover:underline font-body">View all →</Link>
        </div>
        {farms.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10 font-body">No farms yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Farm</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">District</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {farms.map(farm => (
                <tr key={farm.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/dashboard/farms/${farm.id}`} className="font-body font-medium text-gf-dark hover:text-gf-mid">
                      {farm.name}
                    </Link>
                    <p className="text-xs text-gray-400">{farm.size_acres ? `${farm.size_acres} acres` : ''}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-body hidden sm:table-cell">{farm.district || '—'}</td>
                  <td className="px-5 py-3"><Badge value={farm.status} /></td>
                  <td className="px-5 py-3 hidden md:table-cell"><Badge value={farm.subscription_plan} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tasks */}
      {user.role !== 'customer' && allTasks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-semibold text-gf-dark">
                {statusFilter ? `${statusFilter.replace('_', ' ')} Tasks` : 'My Recent Tasks'}
              </h2>
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 font-body border border-gray-200 rounded-full px-2 py-0.5"
                >
                  × Clear
                </button>
              )}
            </div>
            <Link to="/dashboard/tasks" className="text-xs text-gf-mid hover:underline font-body">View all →</Link>
          </div>
          {displayedTasks.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8 font-body">No {statusFilter?.replace('_', ' ')} tasks.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan End</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedTasks.map(task => {
                  const isOverdue = task.status !== 'completed' && task.status !== 'cancelled'
                    && task.planned_end_date && new Date(task.planned_end_date) < today
                  return (
                    <tr key={task.id} className={`hover:bg-gray-50/50 ${isOverdue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-3 font-body font-medium text-gf-dark capitalize">{task.task_type?.replace(/_/g, ' ')}</td>
                      <td className="px-5 py-3"><Badge value={task.status} /></td>
                      <td className="px-5 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">{task.planned_end_date || task.scheduled_date || '—'}</td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        {task.status === 'completed' && task.delay_days !== null && task.delay_days !== undefined ? (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${task.delay_days <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {task.delay_days <= 0 ? 'On time' : `+${task.delay_days}d`}
                          </span>
                        ) : isOverdue ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Overdue</span>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
