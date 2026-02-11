import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import {
  BarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Trophy,
  UserCog,
  Users,
  User
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const baseMenuItems = [
  { name: 'Torneos', path: rutasNavegacion.torneos, icon: Trophy },
  { name: 'Clubes', path: rutasNavegacion.clubs, icon: LayoutDashboard },
  { name: 'Equipos', path: rutasNavegacion.equipos, icon: Shield },
  { name: 'Jugadores', path: rutasNavegacion.jugadores, icon: Users },
  { name: 'Delegados', path: rutasNavegacion.delegados, icon: UserCog }
]

const adminMenuItems = [
  { name: 'Reportes', path: rutasNavegacion.reportes, icon: BarChart }
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const esAdmin = useAuth((state) => state.esAdmin)
  const { userRole, userName, logout } = useAuth()
  const navigate = useNavigate()

  const menuItems = [...baseMenuItems, ...(esAdmin() ? adminMenuItems : [])]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='flex h-screen w-screen'>
      <Toaster />
      {/* Menú lateral */}
      <aside className='hidden md:flex flex-col w-64 bg-gray-900 text-white p-4'>
        <nav className='space-y-2 flex-1'>
          {menuItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition',
                  isActive ? 'bg-gray-700' : 'hover:bg-gray-800'
                )
              }
            >
              <Icon className='w-5 h-5' />
              {name}
            </NavLink>
          ))}
        </nav>

        {/* Información del usuario y botón de cerrar sesión */}
        <div className='mt-auto pt-4 border-t border-gray-700'>
          <div className='flex items-center gap-3 px-3 py-2 group'>
            <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center'>
              <User className='w-5 h-5 text-gray-300' />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='font-medium text-sm text-white truncate'>{userName}</div>
              <div className='text-xs text-gray-400 truncate'>{userRole}</div>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full'
              onClick={handleLogout}
            >
              <LogOut className='w-4 h-4' />
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
            <Menu className='w-6 h-6' />
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-64 bg-gray-900 text-white p-4'>
          <nav className='space-y-2'>
            {menuItems.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition',
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-800'
                  )
                }
              >
                <Icon className='w-5 h-5' />
                {name}
              </NavLink>
            ))}
          </nav>

          {/* Información del usuario y botón de cerrar sesión (versión móvil) */}
          <div className='mt-auto pt-4 border-t border-gray-700'>
            <div className='flex items-center gap-3 px-3 py-2 group'>
              <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center'>
                <User className='w-5 h-5 text-gray-300' />
              </div>
              <div className='flex-1 min-w-0'>
                <div className='font-medium text-sm text-white truncate'>{userName}</div>
                <div className='text-xs text-gray-400 truncate'>{userRole}</div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full'
                onClick={handleLogout}
              >
                <LogOut className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Contenido de la página */}
      <main className='flex-1 w-full p-6 bg-slate-100 flex justify-center'>
        <div className='w-full max-w-7xl mx-auto'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
