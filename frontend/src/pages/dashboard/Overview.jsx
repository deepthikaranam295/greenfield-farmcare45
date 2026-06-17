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
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getFarms(1, 5).catch(() => ({ data: [] })),
      user.role !== 'customer' ? getMyTasks(1, 5).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]).then(([f, t]) => {
      setFarms(f.data || [])
      setTasks(t.data || [])
    }).finally(() => setLoading(false))
  }, [user.role])

  const taskCounts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🌾" label="Total Farms" value={farms.length} color="green" />
        <StatCard icon="⏳" label="Pending Tasks" value={taskCounts.pending} color="amber" />
        <StatCard icon="🔄" label="In Progress" value={taskCounts.in_progress} color="blue" />
        <StatCard icon="✅" label="Completed" value={taskCounts.completed} color="green" />
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

      {/* Recent Tasks (field_team / admin) */}
      {user.role !== 'customer' && tasks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-heading font-semibold text-gf-dark">My Recent Tasks</h2>
            <Link to="/dashboard/tasks" className="text-xs text-gf-mid hover:underline font-body">View all →</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Scheduled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-body font-medium text-gf-dark capitalize">{task.task_type?.replace('_', ' ')}</td>
                  <td className="px-5 py-3"><Badge value={task.status} /></td>
                  <td className="px-5 py-3 text-gray-500 font-body hidden sm:table-cell">{task.scheduled_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
