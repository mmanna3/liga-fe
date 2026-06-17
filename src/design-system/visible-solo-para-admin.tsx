import { ModuloSistema, useAuth } from '@/logica-compartida/hooks/use-auth'
import { ReactNode } from 'react'

interface IProps {
  children: ReactNode
  /** Si se indica, usa permisos del módulo en lugar del rol admin */
  modulo?: ModuloSistema
}

export function VisibleSoloParaAdmin({ children, modulo }: IProps) {
  const puedeEditar = useAuth((state) => state.puedeEditar)
  const esAdmin = useAuth((state) => state.esAdmin)

  const visible = modulo != null ? puedeEditar(modulo) : esAdmin()

  if (!visible) {
    return null
  }

  return <>{children}</>
}
