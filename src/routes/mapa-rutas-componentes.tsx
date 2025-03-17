import { RequiereAutenticacion } from '@/components/RequiereAutenticacion'
import DetalleClub from '@/pages/admin/club/detalle-club'
import CambioEstadoMasivo from '@/pages/admin/equipo/cambio-estado-masivo'
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
import Login from '@/pages/login'
import AdminLayout from '../pages/admin/admin-layout'
import Club from '../pages/admin/club/club'
import CrearClub from '../pages/admin/club/crear-club'
import FichajeHome from '../pages/fichaje/home'
import PaginaNoEncontrada from '../pages/pagina-no-encontrada'
import { rutas } from './rutas'
import Torneo from '@/pages/admin/torneo/torneo'
import CrearTorneo from '@/pages/admin/torneo/crear-torneo'
import DetalleTorneo from '@/pages/admin/torneo/detalle-torneo'
import ReportesPage from '@/pages/admin/reportes'
import ReportePagosPage from '@/pages/admin/reportes/pagos'
import Delegados from '@/pages/admin/delegados/delegados'
import CrearDelegado from '@/pages/admin/delegados/crear-delegado'
import DetalleDelegado from '@/pages/admin/delegados/detalle-delegado'

export const mapaRutasComponentes = [
  {
    path: '/login',
    element: (
      <div className='flex justify-center w-screen bg-gray-100'>
        <Login />
      </div>
    )
  },
  {
    path: '/fichaje',
    element: (
      <div className='w-screen'>
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
    element: (
      <RequiereAutenticacion>
        <AdminLayout />
      </RequiereAutenticacion>
    ),
    children: [
      { path: '', element: <></> },
      { path: rutas.clubs, element: <Club /> },
      { path: rutas.crearClub, element: <CrearClub /> },
      { path: `${rutas.detalleClub}/:id`, element: <DetalleClub /> },
      { path: rutas.equipos, element: <Equipo /> },
      {
        path: `${rutas.cambioEstadoMasivoEquipo}/:equipoid`,
        element: <CambioEstadoMasivo />
      },
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
      },
      { path: rutas.torneos, element: <Torneo /> },
      { path: rutas.crearTorneo, element: <CrearTorneo /> },
      { path: `${rutas.detalleTorneo}/:id`, element: <DetalleTorneo /> },
      { path: rutas.reportes, element: <ReportesPage /> },
      { path: rutas.reportePagos, element: <ReportePagosPage /> },
      { path: rutas.delegados, element: <Delegados /> },
      { path: rutas.crearDelegado, element: <CrearDelegado /> },
      { path: `${rutas.detalleDelegado}/:id`, element: <DetalleDelegado /> }
    ]
  },
  { path: '*', element: <PaginaNoEncontrada /> }
]
