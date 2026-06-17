import { ModuloSistema, useAuth } from '@/logica-compartida/hooks/use-auth'
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { rutasNavegacion } from '@/ruteo/rutas'

interface RequierePermisoModuloProps {
  modulo: ModuloSistema
  children: ReactNode
}

export function RequierePermisoModulo({
  modulo,
  children
}: RequierePermisoModuloProps) {
  const puedeEditar = useAuth((state) => state.puedeEditar)

  if (!puedeEditar(modulo)) {
    return <Navigate to={rutasNavegacion.torneos} replace />
  }

  return <>{children}</>
}
