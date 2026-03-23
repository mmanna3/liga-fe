import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/design-system/base-ui/sheet'
import { Boton } from '@/design-system/ykn-ui/boton'
import type { NombreIcono } from '@/design-system/ykn-ui/icono'
import Icono from '@/design-system/ykn-ui/icono'
import { cn } from '@/logica-compartida/utils'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

interface MenuItem {
  name: string
  path: string
  icono: NombreIcono
}

interface MenuLateralProps {
  menuItems: MenuItem[]
  userName: string | null
  userRole: string | null
  onLogout: () => void
}

function ContenidoMenu({
  menuItems,
  userName,
  userRole,
  onLogout,
  onLinkClick,
  navClassName = 'space-y-2 flex-1'
}: MenuLateralProps & {
  onLinkClick?: () => void
  navClassName?: string
}) {
  return (
    <>
      <nav className={navClassName} data-testid='menu-nav'>
        {menuItems.map(({ name, path, icono }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onLinkClick}
            data-testid={`nav-${name.toLowerCase()}`}
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

      <div className='mt-auto pt-4 border-t border-gray-700'>
        {import.meta.env.DEV && (
          <div className='text-xs font-medium text-yellow-400 mb-0.5 ml-16'>
            env: desarrollo
          </div>
        )}
        <div className='flex items-center gap-3 px-3 py-2 group'>
          <div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center'>
            <Icono nombre='Usuario' className='w-5 h-5 text-gray-300' />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='font-medium text-sm text-white truncate'>
              {userName ?? ''}
            </div>
            <div className='text-xs text-gray-400 truncate'>
              {userRole ?? ''}
            </div>
          </div>
          <Boton
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full'
            onClick={onLogout}
          >
            <Icono nombre='Cerrar sesión' className='w-4 h-4' />
          </Boton>
        </div>
      </div>
    </>
  )
}

export default function MenuLateral({
  menuItems,
  userName,
  userRole,
  onLogout
}: MenuLateralProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <>
      {/* Desktop */}
      <aside
        className='admin-sidebar hidden md:flex flex-col w-64 bg-gray-900 text-white p-4'
        data-testid='menu-lateral'
      >
        <ContenidoMenu
          menuItems={menuItems}
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Boton
            variant='ghost'
            className='md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white'
          >
            <Icono nombre='Menú' className='w-6 h-6' />
          </Boton>
        </SheetTrigger>
        <SheetContent
          side='left'
          className='admin-sidebar w-64 bg-gray-900 text-white p-4 flex flex-col'
        >
          <ContenidoMenu
            menuItems={menuItems}
            userName={userName}
            userRole={userRole}
            onLogout={onLogout}
            onLinkClick={() => setSheetOpen(false)}
            navClassName='space-y-2'
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
