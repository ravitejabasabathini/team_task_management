import { useEffect, useState } from 'react'
import api from '../lib/api'

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight">{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    api
      .get('/dashboard')
      .then((r) => {
        if (!alive) return
        setData(r.data)
      })
      .catch((e) => {
        if (!alive) return
        setError(e?.response?.data?.error?.message || 'Failed to load dashboard')
      })
    return () => {
      alive = false
    }
  }, [])

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">
        {error}
      </div>
    )
  }

  if (!data) return <div className="text-slate-300">Loading…</div>

  const { summary, myTasks } = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-300">Your tasks, status, and overdue items.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Projects" value={summary.projects} />
        <Stat label="TODO" value={summary.tasksByStatus.TODO} />
        <Stat label="In progress" value={summary.tasksByStatus.IN_PROGRESS} />
        <Stat label="Overdue (mine)" value={summary.myOverdue} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold">My assigned tasks</div>
          <div className="text-xs text-slate-400">{myTasks.length} shown</div>
        </div>
        <div className="divide-y divide-white/10">
          {myTasks.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-300">No tasks assigned yet.</div>
          ) : (
            myTasks.map((t) => (
              <div key={t.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold">{t.title}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-white/10 px-2 py-1">{t.status}</span>
                    <span className="rounded-full bg-white/10 px-2 py-1">{t.priority}</span>
                  </div>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {t.project ? t.project.name : '—'} • Due:{' '}
                  {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

