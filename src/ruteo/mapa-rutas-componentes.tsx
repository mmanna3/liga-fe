import Configuracion from '@/pantallas/auth/configuracion/configuracion'
import FechasGeneracionFixture from '@/pantallas/auth/configuracion/generacion-de-fixtures/fechas-generacion-fixture'
import GeneracionDeFixtures from '@/pantallas/auth/configuracion/generacion-de-fixtures/generacion-de-fixtures'
import DetalleClub from '@/pantallas/auth/club/detalle-club'
import AprobarRechazarDelegado from '@/pantallas/auth/delegados/aprobar-rechazar-delegado'
import Delegados from '@/pantallas/auth/delegados/delegados'
import DetalleDelegado from '@/pantallas/auth/delegados/detalle-delegado'
import EliminarDelegado from '@/pantallas/auth/delegados/eliminar-delegado'
import Equipo from '@/pantallas/auth/equipo/components/equipo'
import CrearEquipo from '@/pantallas/auth/equipo/crear-equipo'
import DetalleEquipo from '@/pantallas/auth/equipo/detalle-equipo'
import EditarEquipo from '@/pantallas/auth/equipo/editar-equipo'
import AprobarRechazarJugador from '@/pantallas/auth/jugador/aprobar-rechazar-jugador'
import CambiarEstado from '@/pantallas/auth/jugador/cambiar-estado-jugador'
import DesvincularJugadorDelEquipo from '@/pantallas/auth/jugador/desvincular-jugador-del-equipo'
import DetalleJugador from '@/pantallas/auth/jugador/detalle-jugador'
import Jugador from '@/pantallas/auth/jugador/jugador'
import SuspenderActivar from '@/pantallas/auth/jugador/suspender-activar'
import ReportesPage from '@/pantallas/auth/reportes'
import ReportePagosPage from '@/pantallas/auth/reportes/pagos'
import AgrupadorTorneo from '@/pantallas/auth/torneo/agrupador-torneo/agrupador-torneo'
import CrearAgrupadorTorneo from '@/pantallas/auth/torneo/agrupador-torneo/crear-agrupador-torneo'
import EditarAgrupadorTorneo from '@/pantallas/auth/torneo/agrupador-torneo/editar-agrupador-torneo'
import CrearTorneo from '@/pantallas/auth/torneo/crear-torneo'
import DetalleTorneo from '@/pantallas/auth/torneo/detalle-torneo'
import Fixture from '@/pantallas/auth/torneo/zonas/fixture/fixture'
import ZonasDeLaFase from '@/pantallas/auth/torneo/zonas-de-la-fase'
import Torneo from '@/pantallas/auth/torneo/torneo'
import ErrorPage from '@/pantallas/error'
import Login from '@/pantallas/login'
import PoliticaDePrivacidad from '@/pantallas/politica-de-privacidad'
import { RequiereAutenticacion } from '@/design-system/requiere-autenticacion'
import AuthLayout from '../pantallas/auth/auth-layout'
import Club from '../pantallas/auth/club/club'
import CrearClub from '../pantallas/auth/club/crear-club'
import EditarClub from '../pantallas/auth/club/editar-club'
import Home from '../pantallas/auth/home'
import PaginaNoEncontrada from '../pantallas/pagina-no-encontrada'
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
      { path: rutas.agrupadoresTorneo, element: <AgrupadorTorneo /> },
      { path: rutas.crearAgrupadorTorneo, element: <CrearAgrupadorTorneo /> },
      {
        path: `${rutas.editarAgrupadorTorneo}/:id`,
        element: <EditarAgrupadorTorneo />
      },
      { path: rutas.crearTorneo, element: <CrearTorneo /> },
      { path: `${rutas.detalleTorneo}/:id`, element: <DetalleTorneo /> },
      {
        path: `${rutas.detalleTorneo}/:id/fases/:faseId/zonas`,
        element: <ZonasDeLaFase />
      },
      {
        path: `${rutas.detalleTorneo}/:id/fases/:faseId/zonas/:zonaId/fixture`,
        element: <Fixture />
      },
      { path: rutas.reportes, element: <ReportesPage /> },
      { path: rutas.reportePagos, element: <ReportePagosPage /> },
      { path: rutas.configuracion, element: <Configuracion /> },
      { path: rutas.generacionDeFixtures, element: <GeneracionDeFixtures /> },
      {
        path: `${rutas.fechasGeneracionFixture}/:id`,
        element: <FechasGeneracionFixture />
      },
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
