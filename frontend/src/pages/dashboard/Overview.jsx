import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getFarms } from '../../api/farms'
import { getMyTasks, getCustomerTasks } from '../../api/tasks'
import StatCard from '../../components/dashboard/StatCard'
import Badge from '../../components/dashboard/Badge'

export default function Overview() {
  const { user } = useAuth()
  const [farms, setFarms] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(null)

  useEffect(() => {
    const taskFetch = user.role === 'customer'
      ? getCustomerTasks(1, 100).catch(() => ({ data: [] }))
      : user.role !== 'customer'
        ? getMyTasks(1, 100).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] })

    Promise.all([
      getFarms(1, 100).catch(() => ({ data: [] })),
      taskFetch,
    ]).then(([f, t]) => {
      setFarms(f.data || [])
      setAllTasks(t.data || [])
    }).finally(() => setLoading(false))
  }, [user.role])

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const in3Days = new Date(today); in3Days.setDate(today.getDate() + 3)

  const activeTasks = allTasks.filter(t => !['completed', 'cancelled'].includes(t.status))
  const overdueTasks = activeTasks.filter(t => t.planned_end_date && new Date(t.planned_end_date) < today)
  const dueSoonTasks = activeTasks.filter(t => {
    if (!t.planned_end_date) return false
    const d = new Date(t.planned_end_date)
    return d >= today && d <= in3Days
  })

  const handleCardClick = (status) => setStatusFilter(prev => prev === status ? null : status)

  const displayedTasks = statusFilter
    ? allTasks.filter(t => statusFilter === 'overdue'
        ? (activeTasks.some(a => a.id === t.id) && t.planned_end_date && new Date(t.planned_end_date) < today)
        : statusFilter === 'due_soon'
          ? dueSoonTasks.some(a => a.id === t.id)
          : t.status === statusFilter)
    : allTasks.slice(0, 5)

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 font-body">Loading…</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-gf-dark">
          Good {greeting()}, {user.name.split(' ')[0]}
        </h1>
        <p className="text-gray-500 text-sm font-body mt-0.5">
          {user.role === 'admin' && 'Admin dashboard — manage tasks, farms, and field team.'}
          {user.role === 'field_team' && 'Your assigned tasks for today.'}
          {user.role === 'customer' && 'Track your farm services and activities.'}
        </p>
      </div>

      {/* Alerts (admin + field team) */}
      {user.role !== 'customer' && (overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <div className="space-y-2">
          {overdueTasks.length > 0 && (
            <button
              onClick={() => handleCardClick('overdue')}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors border ${statusFilter === 'overdue' ? 'bg-red-100 border-red-300' : 'bg-red-50 border-red-200 hover:bg-red-100'}`}
            >
              <span className="text-xl">🚨</span>
              <div className="flex-1">
                <p className="text-sm font-heading font-semibold text-red-700">{overdueTasks.length} overdue {overdueTasks.length === 1 ? 'task' : 'tasks'}</p>
                <p className="text-xs text-red-600 font-body">{overdueTasks.slice(0, 3).map(t => (t.task_name || t.task_type)?.replace(/_/g, ' ')).join(', ')}{overdueTasks.length > 3 ? ` +${overdueTasks.length - 3} more` : ''}</p>
              </div>
              <span className="text-xs text-red-600 font-body shrink-0">{statusFilter === 'overdue' ? '× Clear' : 'View →'}</span>
            </button>
          )}
          {dueSoonTasks.length > 0 && (
            <button
              onClick={() => handleCardClick('due_soon')}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors border ${statusFilter === 'due_soon' ? 'bg-amber-100 border-amber-300' : 'bg-amber-50 border-amber-200 hover:bg-amber-100'}`}
            >
              <span className="text-xl">⏰</span>
              <div className="flex-1">
                <p className="text-sm font-heading font-semibold text-amber-700">{dueSoonTasks.length} {dueSoonTasks.length === 1 ? 'task' : 'tasks'} due within 3 days</p>
                <p className="text-xs text-amber-600 font-body">{dueSoonTasks.slice(0, 3).map(t => (t.task_name || t.task_type)?.replace(/_/g, ' ')).join(', ')}{dueSoonTasks.length > 3 ? ` +${dueSoonTasks.length - 3} more` : ''}</p>
              </div>
              <span className="text-xs text-amber-600 font-body shrink-0">{statusFilter === 'due_soon' ? '× Clear' : 'View →'}</span>
            </button>
          )}
        </div>
      )}

      {/* Stat Cards */}
      {user.role === 'admin' && <AdminCards tasks={allTasks} activeTasks={activeTasks} overdueTasks={overdueTasks} dueSoonTasks={dueSoonTasks} farms={farms} statusFilter={statusFilter} onClick={handleCardClick} />}
      {user.role === 'field_team' && <FieldTeamCards tasks={allTasks} activeTasks={activeTasks} overdueTasks={overdueTasks} statusFilter={statusFilter} onClick={handleCardClick} />}
      {user.role === 'customer' && <CustomerCards tasks={allTasks} farms={farms} statusFilter={statusFilter} onClick={handleCardClick} />}

      {/* Tasks table */}
      {user.role !== 'customer' && allTasks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-semibold text-gf-dark">
                {statusFilter ? statusFilter.replace('_', ' ') + ' Tasks' : 'Recent Tasks'}
              </h2>
              {statusFilter && (
                <button onClick={() => setStatusFilter(null)} className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full px-2 py-0.5 font-body">× Clear</button>
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
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Task</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan End</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedTasks.map(task => {
                  const isOverdue = !['completed', 'cancelled'].includes(task.status) && task.planned_end_date && new Date(task.planned_end_date) < today
                  return (
                    <tr key={task.id} className={`hover:bg-gray-50/50 ${isOverdue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-3 font-body font-medium text-gf-dark">
                        <p className="capitalize">{task.task_name || task.task_type?.replace(/_/g, ' ')}</p>
                        {task.task_name && <p className="text-xs text-gray-400 capitalize">{task.task_type?.replace(/_/g, ' ')}</p>}
                      </td>
                      <td className="px-5 py-3"><Badge value={task.status} /></td>
                      <td className="px-5 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">{task.planned_end_date || '—'}</td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        {task.status === 'completed' && task.delay_days !== null && task.delay_days !== undefined ? (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${task.delay_days <= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {task.delay_days <= 0 ? 'On time' : `+${task.delay_days}d late`}
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

      {/* Customer: their service requests */}
      {user.role === 'customer' && allTasks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-heading font-semibold text-gf-dark">My Service Requests & Tasks</h2>
            <Link to="/dashboard/tasks" className="text-xs text-gf-mid hover:underline font-body">View all →</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Service</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allTasks.slice(0, 5).map(task => (
                <tr key={task.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-body font-medium text-gf-dark capitalize">
                    {task.task_name || task.task_type?.replace(/_/g, ' ')}
                  </td>
                  <td className="px-5 py-3"><Badge value={task.status} /></td>
                  <td className="px-5 py-3 text-gray-500 font-body text-xs hidden sm:table-cell">
                    {task.created_at ? new Date(task.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Farms */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-heading font-semibold text-gf-dark">{user.role === 'customer' ? 'My Farms' : 'Farms'}</h2>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {farms.slice(0, 5).map(farm => (
                <tr key={farm.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/dashboard/farms/${farm.id}`} className="font-body font-medium text-gf-dark hover:text-gf-mid">
                      {farm.name}
                    </Link>
                    <p className="text-xs text-gray-400">{farm.size_acres ? `${farm.size_acres} acres` : ''}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-body hidden sm:table-cell">{farm.district || '—'}</td>
                  <td className="px-5 py-3"><Badge value={farm.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function AdminCards({ tasks, activeTasks, overdueTasks, dueSoonTasks, farms, statusFilter, onClick }) {
  const pending = tasks.filter(t => t.status === 'pending').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const completed = tasks.filter(t => t.status === 'completed').length
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard icon="📋" label="Total Tasks" value={tasks.length} color="gray" />
      <StatCard icon="⏳" label="Pending" value={pending} color="amber" active={statusFilter === 'pending'} onClick={() => onClick('pending')} />
      <StatCard icon="🔄" label="In Progress" value={inProgress} color="blue" active={statusFilter === 'in_progress'} onClick={() => onClick('in_progress')} />
      <StatCard icon="✅" label="Completed" value={completed} color="green" active={statusFilter === 'completed'} onClick={() => onClick('completed')} />
      <StatCard icon="🚨" label="Delayed" value={overdueTasks.length} color="red" active={statusFilter === 'overdue'} onClick={() => onClick('overdue')} />
      <StatCard icon="⏰" label="Due Soon" value={dueSoonTasks.length} color="amber" active={statusFilter === 'due_soon'} onClick={() => onClick('due_soon')} />
    </div>
  )
}

function FieldTeamCards({ tasks, activeTasks, overdueTasks, statusFilter, onClick }) {
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const completed = tasks.filter(t => t.status === 'completed').length
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="📋" label="Assigned" value={tasks.length} color="gray" />
      <StatCard icon="🔄" label="In Progress" value={inProgress} color="blue" active={statusFilter === 'in_progress'} onClick={() => onClick('in_progress')} />
      <StatCard icon="✅" label="Completed" value={completed} color="green" active={statusFilter === 'completed'} onClick={() => onClick('completed')} />
      <StatCard icon="🚨" label="Overdue" value={overdueTasks.length} color="red" active={statusFilter === 'overdue'} onClick={() => onClick('overdue')} />
    </div>
  )
}

function CustomerCards({ tasks, farms, statusFilter, onClick }) {
  const active = tasks.filter(t => ['requested', 'pending', 'in_progress'].includes(t.status)).length
  const completed = tasks.filter(t => t.status === 'completed').length
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const in3Days = new Date(today); in3Days.setDate(today.getDate() + 3)
  const upcoming = tasks.filter(t => t.planned_end_date && new Date(t.planned_end_date) >= today && new Date(t.planned_end_date) <= in3Days).length
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="🌾" label="My Farms" value={farms.length} color="green" />
      <StatCard icon="🔄" label="Active Tasks" value={active} color="blue" active={statusFilter === 'active'} onClick={() => onClick('active')} />
      <StatCard icon="✅" label="Completed" value={completed} color="green" active={statusFilter === 'completed'} onClick={() => onClick('completed')} />
      <StatCard icon="⏰" label="Upcoming" value={upcoming} color="amber" />
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
