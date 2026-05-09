import { Link, NavLink, useNavigate } from 'react-router-dom'
import Button from './Button'
import { getStoredUser, logout } from '../lib/auth'

export default function Layout({ children }) {
  const nav = useNavigate()
  const user = getStoredUser()

  function onLogout() {
    logout()
    nav('/login')
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="font-extrabold tracking-tight">
            <span className="text-indigo-300">Task</span>Manager
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-semibold ${isActive ? 'bg-white/10' : 'text-slate-300 hover:bg-white/5'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-semibold ${isActive ? 'bg-white/10' : 'text-slate-300 hover:bg-white/5'}`
              }
            >
              Projects
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            {user ? <div className="hidden text-sm text-slate-300 md:block">{user.name}</div> : null}
            <Button variant="ghost" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}

