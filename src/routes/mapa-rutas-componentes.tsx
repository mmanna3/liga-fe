import { RequiereAutenticacion } from '@/components/RequiereAutenticacion'
import DetalleClub from '@/pages/admin/club/detalle-club'
import Configuracion from '@/pages/admin/configuracion/configuracion'
import BlanquearClaveDelegado from '@/pages/admin/delegados/blanquear-clave-delegado'
import CrearDelegado from '@/pages/admin/delegados/crear-delegado'
import Delegados from '@/pages/admin/delegados/delegados'
import DetalleDelegado from '@/pages/admin/delegados/detalle-delegado'
import EliminarDelegado from '@/pages/admin/delegados/eliminar-delegado'
import CambioEstadoMasivo from '@/pages/admin/equipo/cambio-estado-masivo'
import CrearEquipo from '@/pages/admin/equipo/crear-equipo'
import DetalleEquipo from '@/pages/admin/equipo/detalle-equipo'
import EditarEquipo from '@/pages/admin/equipo/editar-equipo'
import Equipo from '@/pages/admin/equipo/equipo'
import Pases from '@/pages/admin/equipo/pases'
import Home from '@/pages/admin/home/home'
import AprobarRechazarJugador from '@/pages/admin/jugador/aprobar-rechazar-jugador'
import CambiarEstado from '@/pages/admin/jugador/cambiar-estado-jugador'
import DesvincularJugadorDelEquipo from '@/pages/admin/jugador/desvincular-jugador-del-equipo'
import DetalleJugador from '@/pages/admin/jugador/detalle-jugador'
import EliminarJugador from '@/pages/admin/jugador/eliminar-jugador'
import Jugador from '@/pages/admin/jugador/jugador'
import SuspenderActivar from '@/pages/admin/jugador/suspender-activar'
import ReportesPage from '@/pages/admin/reportes'
import ReportePagosPage from '@/pages/admin/reportes/pagos'
import CrearTorneoWizard from '@/pages/admin/torneo/crear-torneo-wizard'
import DetalleTorneo from '@/pages/admin/torneo/detalle-torneo'
import EditarFixturePage from '@/pages/admin/torneo/editar-fixture'
import EditarInformacionTorneoPage from '@/pages/admin/torneo/editar-informacion-torneo'
import EditarZonasPage from '@/pages/admin/torneo/editar-zonas'
import InformacionDelTorneoPage from '@/pages/admin/torneo/informacion-del-torneo'
import TorneosHome from '@/pages/admin/torneo/home'
import Torneo from '@/pages/admin/torneo/torneo'
import ErrorPage from '@/pages/error'
import FichajeEnOtroEquipo from '@/pages/fichaje/fichaje-en-otro-equipo'
import FichajeError from '@/pages/fichaje/fichaje-error'
import FichajeExitoso from '@/pages/fichaje/fichaje-exitoso'
import Login from '@/pages/login'
import PoliticaDePrivacidad from '@/pages/politica-de-privacidad'
import AdminLayout from '../pages/admin/admin-layout'
import Club from '../pages/admin/club/club'
import CrearClub from '../pages/admin/club/crear-club'
import FichajeHome from '../pages/fichaje/home'
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
    path: '/fichaje',
    element: (
      <div className='w-screen'>
        <FichajeHome />
      </div>
    )
  },
  {
    path: '/fichaje-en-otro-equipo',
    element: (
      <div className='w-screen'>
        <FichajeEnOtroEquipo />
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
    path: '/politica-de-privacidad',
    element: <PoliticaDePrivacidad />
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
      { path: '', element: <Home /> },
      { path: rutas.clubs, element: <Club /> },
      { path: rutas.crearClub, element: <CrearClub /> },
      { path: `${rutas.detalleClub}/:id`, element: <DetalleClub /> },
      { path: rutas.equipos, element: <Equipo /> },
      {
        path: `${rutas.cambioEstadoMasivoEquipo}/:equipoid`,
        element: <CambioEstadoMasivo />
      },
      {
        path: `${rutas.pases}/:equipoid`,
        element: <Pases />
      },
      { path: `${rutas.crearEquipo}/:clubid`, element: <CrearEquipo /> },
      { path: `${rutas.detalleEquipo}/:id`, element: <DetalleEquipo /> },
      { path: `${rutas.editarEquipo}/:id`, element: <EditarEquipo /> },
      { path: rutas.jugadores, element: <Jugador /> },
      { path: `${rutas.detalleJugador}/:id`, element: <DetalleJugador /> },
      {
        path: `${rutas.eliminarJugador}/:id/:dni`,
        element: <EliminarJugador />
      },
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
      { path: rutas.torneosHome, element: <TorneosHome /> },
      { path: rutas.crearTorneo, element: <CrearTorneoWizard /> },
      { path: `${rutas.detalleTorneo}/:id`, element: <DetalleTorneo /> },
      {
        path: `${rutas.torneosInformacion}/:id`,
        element: <InformacionDelTorneoPage />
      },
      {
        path: `${rutas.torneosInformacion}/:id/editar`,
        element: <EditarInformacionTorneoPage />
      },
      {
        path: `${rutas.torneosInformacion}/:id/zonas`,
        element: <EditarZonasPage />
      },
      {
        path: `${rutas.torneosInformacion}/:id/fixture`,
        element: <EditarFixturePage />
      },
      { path: rutas.reportes, element: <ReportesPage /> },
      { path: rutas.reportePagos, element: <ReportePagosPage /> },
      { path: rutas.configuracion, element: <Configuracion /> },
      { path: rutas.delegados, element: <Delegados /> },
      { path: rutas.crearDelegado, element: <CrearDelegado /> },
      { path: `${rutas.detalleDelegado}/:id`, element: <DetalleDelegado /> },
      {
        path: `${rutas.blanquearClaveDelegado}/:id/:usuario`,
        element: <BlanquearClaveDelegado />
      },
      {
        path: `${rutas.eliminarDelegado}/:id/:usuario`,
        element: <EliminarDelegado />
      }
    ]
  },
  { path: '*', element: <PaginaNoEncontrada /> }
]
