import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getFarm, getFarmTasks, getFarmReports } from '../../api/farms'
import Badge from '../../components/dashboard/Badge'
import Pagination from '../../components/dashboard/Pagination'

export default function FarmDetail() {
  const { id } = useParams()
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
          <div className="flex gap-2 flex-wrap">
            <Badge value={farm.status} />
            <Badge value={farm.subscription_plan} />
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
        {['tasks', 'reports'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-heading font-semibold capitalize transition-all ${
              tab === t ? 'bg-white shadow-sm text-gf-dark' : 'text-gray-500 hover:text-gf-dark'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tasks */}
      {tab === 'tasks' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12 font-body">No tasks for this farm.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden sm:table-cell">Scheduled</th>
                  <th className="text-left px-5 py-3 text-xs font-heading text-gray-500 uppercase tracking-wide hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tasks.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-body font-medium text-gf-dark capitalize">{t.task_type?.replace('_', ' ')}</td>
                    <td className="px-5 py-3"><Badge value={t.status} /></td>
                    <td className="px-5 py-3 text-gray-500 font-body hidden sm:table-cell">{t.scheduled_date || '—'}</td>
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
    </div>
  )
}
