import { Toaster } from '@/design-system/base-ui/sonner'
import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { rutasNavegacion } from '@/ruteo/rutas'
import { Outlet, useNavigate } from 'react-router-dom'
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
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='flex min-h-screen w-screen'>
      <Toaster className='print:hidden' />
      <MenuLateral
        menuItems={menuItems}
        userName={userName}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {/* Contenido de la página */}
      <main className='flex flex-1 w-full min-h-0 justify-center p-6 bg-slate-100 print:bg-white print:p-4'>
        <div className='w-full flex-1'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
