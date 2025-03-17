import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { LayoutDashboard, Menu, Shield, Trophy, Users, BarChart, UserCog } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const menuItems = [
  { name: 'Torneos', path: rutasNavegacion.torneos, icon: Trophy },
  { name: 'Clubes', path: rutasNavegacion.clubs, icon: LayoutDashboard },
  { name: 'Equipos', path: rutasNavegacion.equipos, icon: Shield },
  { name: 'Jugadores', path: rutasNavegacion.jugadores, icon: Users },
  { name: 'Delegados', path: rutasNavegacion.delegados, icon: UserCog },
  { name: 'Reportes', path: rutasNavegacion.reportes, icon: BarChart }
]

export default function AdminLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className='flex h-screen w-screen'>
      <Toaster />
      {/* Menú lateral */}
      <aside className='hidden md:flex flex-col w-64 bg-gray-900 text-white p-4 space-y-4'>
        {/* <h1 className='text-xl font-bold'>Admin</h1> ACÁ PONER EL NOMBRE DE LA LIGA */}
        <nav className='space-y-2'>
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
          {/* <h1 className='text-xl font-bold'>Panel Admin</h1> */}
          <nav className='space-y-2 mt-4'>
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
        </SheetContent>
      </Sheet>

      {/* Contenido de la página */}
      <main className='flex-1 w-full p-6 bg-slate-100 flex justify-center'>
        <div className='w-full max-w-4xl mx-auto'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
