import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { useAuth } from '@/hooks/use-auth'
import { usePaletaColores } from '@/hooks/use-paleta-colores'
import { Home, LogOut, User } from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

export default function AdminLayout() {
  const { userRole, userName, logout } = useAuth()
  const navigate = useNavigate()
  usePaletaColores()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='min-h-screen w-screen bg-slate-100'>
      <Toaster />

      <header className='fixed top-0 left-0 right-0 z-50 h-14 bg-primary text-primary-foreground shadow-md'>
        <div className='h-full w-full max-w-7xl mx-auto flex items-center justify-between px-6'>
          <Link
            to='/admin'
            className='group p-2 rounded-lg hover:bg-white/15 hover:scale-105 transition-all'
          >
            <Home className='w-5 h-5 text-primary-foreground' />
          </Link>

          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center'>
              <User className='w-4 h-4' />
            </div>
            <div className='hidden sm:block text-right'>
              <div className='text-sm font-medium leading-tight'>
                {userName}
              </div>
              <div className='text-xs opacity-70'>{userRole}</div>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 rounded-full'
              onClick={handleLogout}
            >
              <LogOut className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </header>

      <main className='pt-20 px-6 pb-6'>
        <div className='w-full max-w-7xl mx-auto'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
