import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import Button from '../components/Button'
import Field from '../components/Field'

function Badge({ children }) {
  return <span className="rounded-full bg-white/10 px-2 py-1 text-xs">{children}</span>
}

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')

  const [memberEmail, setMemberEmail] = useState('')
  const [memberRole, setMemberRole] = useState('MEMBER')

  const [taskTitle, setTaskTitle] = useState('')
  const [taskDue, setTaskDue] = useState('')

  const isAdmin = project?.role === 'ADMIN'
  const canCreateTask = useMemo(() => taskTitle.trim().length >= 2, [taskTitle])

  async function load() {
    setError('')
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/tasks', { params: { projectId: id } }),
      ])
      setProject(pRes.data.project)
      setTasks(tRes.data.tasks || [])
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to load project')
    }
  }

  useEffect(() => {
    load()
  }, [id])

  async function addMember(e) {
    e.preventDefault()
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole })
      setMemberEmail('')
      await load()
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to add member')
    }
  }

  async function createTask(e) {
    e.preventDefault()
    if (!canCreateTask) return
    try {
      await api.post('/tasks', {
        projectId: id,
        title: taskTitle,
        dueDate: taskDue ? new Date(taskDue) : null,
      })
      setTaskTitle('')
      setTaskDue('')
      await load()
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to create task')
    }
  }

  async function updateTaskStatus(taskId, status) {
    try {
      await api.patch(`/tasks/${taskId}`, { status })
      await load()
    } catch (e) {
      setError(e?.response?.data?.error?.message || 'Failed to update task')
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>
    )
  }

  if (!project) return <div className="text-slate-300">Loading…</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-indigo-300">Project</div>
          <h1 className="text-3xl font-extrabold tracking-tight">{project.name}</h1>
          <p className="mt-1 text-sm text-slate-300">{project.description || '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{project.role}</Badge>
          <Badge>{project.members.length} members</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5">
          <div className="px-4 py-3 text-sm font-semibold">Tasks</div>
          <div className="px-4 pb-4">
            <form onSubmit={createTask} className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <Field label="Title" placeholder="e.g. Design homepage" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
              </div>
              <div>
                <Field label="Due date" type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
              </div>
              <div className="md:col-span-3">
                <Button disabled={!canCreateTask}>Create task</Button>
              </div>
            </form>
          </div>
          <div className="divide-y divide-white/10">
            {tasks.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-300">No tasks yet.</div>
            ) : (
              tasks.map((t) => (
                <div key={t.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">{t.title}</div>
                    <div className="flex items-center gap-2">
                      <Badge>{t.priority}</Badge>
                      <Badge>{t.status}</Badge>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'} • Assignee:{' '}
                    {t.assignee?.name || '—'}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => updateTaskStatus(t.id, 'TODO')}>
                      TODO
                    </Button>
                    <Button variant="ghost" onClick={() => updateTaskStatus(t.id, 'IN_PROGRESS')}>
                      In progress
                    </Button>
                    <Button variant="ghost" onClick={() => updateTaskStatus(t.id, 'DONE')}>
                      Done
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5">
            <div className="px-4 py-3 text-sm font-semibold">Team</div>
            <div className="divide-y divide-white/10">
              {project.members.map((m) => (
                <div key={m.user.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{m.user.name}</div>
                      <div className="text-xs text-slate-400">{m.user.email}</div>
                    </div>
                    <Badge>{m.role}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Invite member</div>
            {!isAdmin ? (
              <div className="mt-2 text-sm text-slate-300">Only Admins can invite members.</div>
            ) : (
              <form onSubmit={addMember} className="mt-3 grid gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Field
                    label="Member email"
                    placeholder="member@example.com"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    required
                  />
                </div>
                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-slate-300">Role</div>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </label>
                <div className="md:col-span-3">
                  <Button>Add member</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

