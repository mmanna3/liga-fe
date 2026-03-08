import { useAuth } from '@/utils/hooks/use-auth'
import { ReactNode } from 'react'

interface IProps {
  children: ReactNode
}

export function VisibleSoloParaAdmin({ children }: IProps) {
  const { esAdmin } = useAuth()

  if (!esAdmin()) {
    return null
  }

  return <>{children}</>
}
