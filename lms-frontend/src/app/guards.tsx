import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../shared/hooks/redux'

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const user = useAppSelector(s => s.auth.user)
  if (!user) return <Navigate to="/" replace />
  return children
}

export function RequireRole({ role, children }: { role: 'admin' | 'user' | 'mentor'; children: React.ReactElement }) {
  const user = useAppSelector(s => s.auth.user)
  if (!user) return <Navigate to="/" replace />
  if (user.role !== role) {
    const fallback = user.role === 'admin' ? '/admin' : user.role === 'mentor' ? '/mentor' : '/app'
    return <Navigate to={fallback} replace />
  }
  return children
}
