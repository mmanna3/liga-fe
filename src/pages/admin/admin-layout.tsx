import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import Icono from '@/components/ykn-ui/icono'
import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

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
  }
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const esAdmin = useAuth((state) => state.esAdmin)
  const { userRole, userName, logout } = useAuth()
  const navigate = useNavigate()

  const menuItems = [...baseMenuItems, ...(esAdmin() ? adminMenuItems : [])]
  const { pathname } = useLocation()
  const isHome = pathname === '/' || pathname === ''

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='flex h-screen w-screen'>
      <Toaster />
      {/* Menú lateral */}
      <aside className='admin-sidebar hidden md:flex flex-col w-64 bg-gray-900 text-white p-4'>
        <nav className='space-y-2 flex-1'>
          {menuItems.map(({ name, path, icono }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition',
                  isActive
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-800 hover:text-green-300'
                )
              }
            >
              <Icono nombre={icono} className='w-5 h-5' />
              {name}
            </NavLink>
          ))}
        </nav>

        {/* Información del usuario y botón de cerrar sesión */}
        <div className='mt-auto pt-4 border-t border-gray-700'>
          <div className='flex items-center gap-3 px-3 py-2 group'>
            <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center'>
              <Icono nombre='Usuario' className='w-5 h-5 text-gray-300' />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='font-medium text-sm text-white truncate'>
                {userName}
              </div>
              <div className='text-xs text-gray-400 truncate'>{userRole}</div>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full'
              onClick={handleLogout}
            >
              <Icono nombre='Cerrar sesión' className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </aside>

      {/* Menú lateral responsive */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant='ghost'
            className='md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white'
          >
            <Icono nombre='Menú' className='w-6 h-6' />
          </Button>
        </SheetTrigger>
        <SheetContent
          side='left'
          className='admin-sidebar w-64 bg-gray-900 text-white p-4'
        >
          <nav className='space-y-2'>
            {menuItems.map(({ name, path, icono }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition',
                    isActive
                      ? 'bg-gray-700'
                      : 'hover:bg-gray-800 hover:text-green-300'
                  )
                }
              >
                <Icono nombre={icono} className='w-5 h-5' />
                {name}
              </NavLink>
            ))}
          </nav>

          {/* Información del usuario y botón de cerrar sesión (versión móvil) */}
          <div className='mt-auto pt-4 border-t border-gray-700'>
            <div className='flex items-center gap-3 px-3 py-2 group'>
              <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center'>
                <Icono nombre='Usuario' className='w-5 h-5 text-gray-300' />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='font-medium text-sm text-white truncate'>
                  {userName}
                </div>
                <div className='text-xs text-gray-400 truncate'>{userRole}</div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full'
                onClick={handleLogout}
              >
                <Icono nombre='Cerrar sesión' className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

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
