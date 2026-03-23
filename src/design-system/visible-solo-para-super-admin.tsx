import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { ReactNode } from 'react'

interface IProps {
  children: ReactNode
}

export function VisibleSoloParaSuperAdmin({ children }: IProps) {
  const { userRole } = useAuth()

  if (userRole !== 'SuperAdministrador') {
    return null
  }

  return <>{children}</>
}
