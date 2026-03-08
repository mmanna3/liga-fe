import { useAuth } from '@/hooks/use-auth'
import { Navigate, useLocation } from 'react-router-dom'

interface RequiereAutenticacionProps {
  children: React.ReactNode
}

export function RequiereAutenticacion({
  children
}: RequiereAutenticacionProps) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return children
}
