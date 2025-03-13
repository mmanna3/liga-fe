import DetalleClub from '@/pages/admin/club/detalle-club'
import CrearEquipo from '@/pages/admin/equipo/crear-equipo'
import DetalleEquipo from '@/pages/admin/equipo/detalle-equipo'
import Equipo from '@/pages/admin/equipo/equipo'
import AprobarRechazarJugador from '@/pages/admin/jugador/aprobar-rechazar-jugador'
import CambiarEstado from '@/pages/admin/jugador/cambiar-estado-jugador'
import DetalleJugador from '@/pages/admin/jugador/detalle-jugador'
import Jugador from '@/pages/admin/jugador/jugador'
import ErrorPage from '@/pages/error'
import FichajeError from '@/pages/fichaje/fichaje-error'
import FichajeExitoso from '@/pages/fichaje/fichaje-exitoso'
import AdminLayout from '../pages/admin/admin-layout'
import Club from '../pages/admin/club/club'
import CrearClub from '../pages/admin/club/crear-club'
import FichajeHome from '../pages/fichaje/home'
import PaginaNoEncontrada from '../pages/pagina-no-encontrada'
import { rutas } from './rutas'

export const mapaRutasComponentes = [
  {
    path: '/fichaje',
    element: (
      <div className='flex justify-center w-screen'>
        <FichajeHome />
      </div>
    )
  },
  {
    path: '/fichaje-exitoso',
    element: <FichajeExitoso />
  },
  {
    path: '/fichaje-error',
    element: <FichajeError />
  },
  {
    path: '/admin',
    errorElement: <ErrorPage />,
    element: <AdminLayout />,
    children: [
      { path: '', element: <></> },
      { path: rutas.clubs, element: <Club /> },
      { path: rutas.crearClub, element: <CrearClub /> },
      { path: `${rutas.detalleClub}/:id`, element: <DetalleClub /> },
      { path: rutas.equipos, element: <Equipo /> },
      { path: `${rutas.crearEquipo}/:clubid`, element: <CrearEquipo /> },
      { path: `${rutas.detalleEquipo}/:id`, element: <DetalleEquipo /> },
      { path: rutas.jugadores, element: <Jugador /> },
      { path: `${rutas.detalleJugador}/:id`, element: <DetalleJugador /> },
      {
        path: `${rutas.aprobarRechazarJugador}/:jugadorequipoid/:jugadorid`,
        element: <AprobarRechazarJugador />
      },
      {
        path: `${rutas.cambiarEstadoJugador}/:jugadorequipoid/:jugadorid`,
        element: <CambiarEstado />
      }
    ]
  },
  { path: '*', element: <PaginaNoEncontrada /> }
]
