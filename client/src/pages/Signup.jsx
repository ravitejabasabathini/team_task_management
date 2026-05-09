import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Field from '../components/Field'
import Button from '../components/Button'
import { signup } from '../lib/auth'

export default function Signup() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await signup({ name, email, password })
      nav('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-full px-4 py-12">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6">
          <div className="text-xs font-semibold text-indigo-300">Task Manager</div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-slate-300">Start organizing work with your team.</p>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button disabled={busy} className="w-full">
            {busy ? 'Creating…' : 'Create account'}
          </Button>
        </form>

        <div className="mt-4 text-sm text-slate-300">
          Already have an account?{' '}
          <Link className="font-semibold text-indigo-300 hover:text-indigo-200" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

