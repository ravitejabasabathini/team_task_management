import { Navigate, useLocation } from 'react-router-dom'
import { getStoredUser } from '../lib/auth'

export default function RequireAuth({ children }) {
  const user = getStoredUser()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  return children
}

