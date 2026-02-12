import { useAuth } from '@/hooks/use-auth'
import { rutasNavegacion } from '@/routes/rutas'
import {
  BarChart,
  LayoutDashboard,
  Settings,
  Shield,
  Trophy,
  UserCog,
  Users
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const baseItems = [
  {
    name: 'Torneos',
    path: rutasNavegacion.torneos,
    icon: Trophy,
    description: 'Gestiona torneos y competencias'
  },
  {
    name: 'Clubes',
    path: rutasNavegacion.clubs,
    icon: LayoutDashboard,
    description: 'Administra clubes afiliados'
  },
  {
    name: 'Equipos',
    path: rutasNavegacion.equipos,
    icon: Shield,
    description: 'Gestiona equipos y planteles'
  },
  {
    name: 'Jugadores',
    path: rutasNavegacion.jugadores,
    icon: Users,
    description: 'Registro y control de jugadores'
  },
  {
    name: 'Delegados',
    path: rutasNavegacion.delegados,
    icon: UserCog,
    description: 'Administra delegados de equipos'
  },
  {
    name: 'Configuración',
    path: rutasNavegacion.configuracion,
    icon: Settings,
    description: 'Personaliza la aplicación'
  }
]

const adminItems = [
  {
    name: 'Reportes',
    path: rutasNavegacion.reportes,
    icon: BarChart,
    description: 'Estadísticas y reportes'
  }
]

export default function Home() {
  const navigate = useNavigate()
  const esAdmin = useAuth((state) => state.esAdmin)

  const items = [...baseItems, ...(esAdmin() ? adminItems : [])]

  return (
    <div className='fixed inset-0 top-14 bg-gradient-to-br from-primary to-primary/60 overflow-auto'>
      <div className='flex flex-col items-center px-6 py-10'>
        {/* Logo y título */}
        <div className='w-24 h-24 bg-white/20 rounded-2xl mb-4 flex items-center justify-center'>
          <img
            src='/logo.png'
            alt='Logo'
            className='w-16 h-16 object-contain'
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
        <h1 className='text-3xl font-bold text-primary-foreground'>EDeFI</h1>
        <p className='text-primary-foreground/70 text-lg mb-10'>
          Panel administrativo
        </p>

        {/* Grid de opciones */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl'>
          {items.map(({ name, path, icon: Icon, description }) => (
            <button
              key={path}
              type='button'
              onClick={() => navigate(path)}
              className='group rounded-2xl p-6 bg-white/95 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col items-center text-center hover:cursor-pointer'
            >
              <div className='rounded-xl w-14 h-14 flex items-center justify-center mb-4 bg-primary/10 group-hover:bg-primary/20 transition-colors'>
                <Icon className='w-7 h-7 text-primary' />
              </div>

              <h3 className='font-semibold text-lg text-slate-900 mb-1'>
                {name}
              </h3>

              <p className='text-sm text-slate-600'>{description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
