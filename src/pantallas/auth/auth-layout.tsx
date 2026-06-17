import { Toaster } from '@/design-system/base-ui/sonner'
import { ModuloSistema, useAuth } from '@/logica-compartida/hooks/use-auth'
import type { NombreIcono } from '@/design-system/ykn-ui/icono'
import { rutasNavegacion } from '@/ruteo/rutas'
import { Outlet, useNavigate } from 'react-router-dom'
import MenuLateral from './menu-lateral'

type MenuItem = {
  name: string
  path: string
  icono: NombreIcono
  modulo: ModuloSistema
}

const menuItemsConfig: MenuItem[] = [
  {
    name: 'Torneos',
    path: rutasNavegacion.torneos,
    icono: 'Torneos',
    modulo: ModuloSistema.Torneos
  },
  {
    name: 'Clubes',
    path: rutasNavegacion.clubs,
    icono: 'Clubes',
    modulo: ModuloSistema.Clubes
  },
  {
    name: 'Equipos',
    path: rutasNavegacion.equipos,
    icono: 'Equipos',
    modulo: ModuloSistema.Equipos
  },
  {
    name: 'Jugadores',
    path: rutasNavegacion.jugadores,
    icono: 'Jugadores',
    modulo: ModuloSistema.Jugadores
  },
  {
    name: 'Delegados',
    path: rutasNavegacion.delegados,
    icono: 'Delegados',
    modulo: ModuloSistema.Delegados
  },
  {
    name: 'Árbitros',
    path: rutasNavegacion.arbitros,
    icono: 'Arbitros',
    modulo: ModuloSistema.Arbitros
  },
  {
    name: 'Reportes',
    path: rutasNavegacion.reportes,
    icono: 'Reportes',
    modulo: ModuloSistema.Reportes
  },
  {
    name: 'Configuración',
    path: rutasNavegacion.configuracion,
    icono: 'Configuracion',
    modulo: ModuloSistema.Configuracion
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
  const tieneAccesoModulo = useAuth((state) => state.tieneAccesoModulo)
  const esSuperAdministrador = useAuth((state) => state.esSuperAdministrador)
  const { userRole, userName, logout } = useAuth()
  const navigate = useNavigate()

  const menuItems = [
    ...menuItemsConfig.filter((item) => tieneAccesoModulo(item.modulo)),
    ...(esSuperAdministrador() ? superAdminMenuItems : [])
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

      <main className='flex flex-1 flex-col w-full min-h-0 p-6 bg-slate-100 print:bg-white print:p-4'>
        <div className='flex w-full flex-1 flex-col min-h-0'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
