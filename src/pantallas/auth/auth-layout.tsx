import { Toaster } from '@/design-system/base-ui/sonner'
import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { cn } from '@/logica-compartida/utils'
import { rutasNavegacion } from '@/ruteo/rutas'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import MenuLateral from './menu-lateral'

const baseMenuItems = [
  { name: 'Torneos', path: rutasNavegacion.torneos, icono: 'Torneos' as const },
  { name: 'Clubes', path: rutasNavegacion.clubs, icono: 'Clubes' as const },
  { name: 'Equipos', path: rutasNavegacion.equipos, icono: 'Equipos' as const },
  {
    name: 'Jugadores',
    path: rutasNavegacion.jugadores,
    icono: 'Jugadores' as const
  },
  {
    name: 'Delegados',
    path: rutasNavegacion.delegados,
    icono: 'Delegados' as const
  }
]

const adminMenuItems = [
  {
    name: 'Reportes',
    path: rutasNavegacion.reportes,
    icono: 'Reportes' as const
  },
  {
    name: 'Configuración',
    path: rutasNavegacion.configuracion,
    icono: 'Configuracion' as const
  }
]

const superAdminMenuItems = [
  {
    name: 'SuperAdmin',
    path: rutasNavegacion.superAdmin,
    icono: 'SuperAdmin' as const
  }
]

export default function AuthLayout() {
  const esAdmin = useAuth((state) => state.esAdmin)
  const { userRole, userName, logout } = useAuth()
  const navigate = useNavigate()

  const esSuperAdmin = userRole === 'SuperAdministrador'
  const menuItems = [
    ...baseMenuItems,
    ...(esAdmin() ? adminMenuItems : []),
    ...(esSuperAdmin ? superAdminMenuItems : [])
  ]
  const { pathname } = useLocation()
  const isHome = pathname === '/' || pathname === ''

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='flex min-h-screen w-screen'>
      <Toaster />
      <MenuLateral
        menuItems={menuItems}
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {/* Contenido de la página */}
      <main
        className={cn(
          'flex-1 w-full min-h-0',
          isHome ? 'flex flex-col p-0' : 'flex justify-center p-6 bg-slate-100'
        )}
      >
        <div
          className={cn(
            'w-full',
            isHome ? 'flex-1 min-h-0 flex flex-col' : 'flex-1'
          )}
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
