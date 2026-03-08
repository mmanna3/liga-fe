import DetalleClub from '@/pages/auth/club/detalle-club'
import AprobarRechazarDelegado from '@/pages/auth/delegados/aprobar-rechazar-delegado'
import Delegados from '@/pages/auth/delegados/delegados'
import DetalleDelegado from '@/pages/auth/delegados/detalle-delegado'
import EliminarDelegado from '@/pages/auth/delegados/eliminar-delegado'
import Equipo from '@/pages/auth/equipo/components/equipo'
import CrearEquipo from '@/pages/auth/equipo/crear-equipo'
import DetalleEquipo from '@/pages/auth/equipo/detalle-equipo'
import EditarEquipo from '@/pages/auth/equipo/editar-equipo'
import AprobarRechazarJugador from '@/pages/auth/jugador/aprobar-rechazar-jugador'
import CambiarEstado from '@/pages/auth/jugador/cambiar-estado-jugador'
import DesvincularJugadorDelEquipo from '@/pages/auth/jugador/desvincular-jugador-del-equipo'
import DetalleJugador from '@/pages/auth/jugador/detalle-jugador'
import Jugador from '@/pages/auth/jugador/jugador'
import SuspenderActivar from '@/pages/auth/jugador/suspender-activar'
import ReportesPage from '@/pages/auth/reportes'
import ReportePagosPage from '@/pages/auth/reportes/pagos'
import CrearTorneo from '@/pages/auth/torneo/crear-torneo'
import DetalleTorneo from '@/pages/auth/torneo/detalle-torneo'
import Torneo from '@/pages/auth/torneo/torneo'
import ErrorPage from '@/pages/error'
import Login from '@/pages/login'
import PoliticaDePrivacidad from '@/pages/politica-de-privacidad'
import { RequiereAutenticacion } from '@/ui/requiere-autenticacion'
import AuthLayout from '../pages/auth/auth-layout'
import Club from '../pages/auth/club/club'
import CrearClub from '../pages/auth/club/crear-club'
import EditarClub from '../pages/auth/club/editar-club'
import Home from '../pages/auth/home'
import PaginaNoEncontrada from '../pages/pagina-no-encontrada'
import { rutas } from './rutas'
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
    path: '/politica-de-privacidad',
    element: <PoliticaDePrivacidad />
  },
  {
    path: '/',
    errorElement: <ErrorPage />,
    element: (
      <RequiereAutenticacion>
        <AuthLayout />
      </RequiereAutenticacion>
    ),
    children: [
      { path: '', element: <Home /> },
      { path: rutas.clubs, element: <Club /> },
      { path: rutas.crearClub, element: <CrearClub /> },
      { path: `${rutas.detalleClub}/:id`, element: <DetalleClub /> },
      { path: `${rutas.editarClub}/:id`, element: <EditarClub /> },
      { path: rutas.equipos, element: <Equipo /> },
      { path: `${rutas.crearEquipo}/:clubid`, element: <CrearEquipo /> },
      { path: `${rutas.detalleEquipo}/:id`, element: <DetalleEquipo /> },
      { path: `${rutas.editarEquipo}/:id`, element: <EditarEquipo /> },
      { path: rutas.jugadores, element: <Jugador /> },
      { path: `${rutas.detalleJugador}/:id`, element: <DetalleJugador /> },
      {
        path: `${rutas.desvincularJugadorDelEquipo}/:id/:dni/:equipoId/:equipoNombre`,
        element: <DesvincularJugadorDelEquipo />
      },
      {
        path: `${rutas.aprobarRechazarJugador}/:jugadorequipoid/:jugadorid`,
        element: <AprobarRechazarJugador />
      },
      {
        path: `${rutas.suspenderActivar}/:jugadorequipoid/:jugadorid`,
        element: <SuspenderActivar />
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
      { path: `${rutas.detalleDelegado}/:id`, element: <DetalleDelegado /> },
      {
        path: `${rutas.aprobarRechazarDelegado}/:id/:delegadoClubId`,
        element: <AprobarRechazarDelegado />
      },
      {
        path: `${rutas.eliminarDelegado}/:id/:usuario`,
        element: <EliminarDelegado />
      }
    ]
  },
  { path: '*', element: <PaginaNoEncontrada /> }
]
