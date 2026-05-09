import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Button from '../components/Button'
import Field from '../components/Field'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const canCreate = useMemo(() => name.trim().length >= 2, [name])

  async function load() {
    setError('')
    try {
      const { data } = await api.get('/projects')
      setProjects(data.projects || [])
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to load projects')
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function onCreate(e) {
    e.preventDefault()
    if (!canCreate) return
    setBusy(true)
    setError('')
    try {
      await api.post('/projects', { name, description })
      setName('')
      setDescription('')
      await load()
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to create project')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm text-slate-300">Create a project, invite members, assign tasks.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={onCreate} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="text-sm font-semibold">Create project</div>
          <Field label="Name" placeholder="e.g. Website redesign" value={name} onChange={(e) => setName(e.target.value)} />
          <Field
            label="Description"
            placeholder="Optional"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button disabled={busy || !canCreate}>{busy ? 'Creating…' : 'Create'}</Button>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="px-4 py-3 text-sm font-semibold">Your projects</div>
          <div className="divide-y divide-white/10">
            {projects.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-300">No projects yet.</div>
            ) : (
              projects.map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="block px-4 py-3 hover:bg-white/5 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-slate-400">
                      {p.role} • {p.memberCount} members
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-400 line-clamp-2">{p.description || '—'}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

