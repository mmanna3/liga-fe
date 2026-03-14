export const rutas = {
  clubs: 'clubs',
  crearClub: 'clubs/crear',
  detalleClub: 'clubs/detalle',
  editarClub: 'clubs/editar',
  equipos: 'equipos',
  crearEquipo: 'equipos/crear',
  editarEquipo: 'equipos/editar',
  detalleEquipo: 'equipos/detalle',
  jugadores: 'jugadores',
  detalleJugador: 'jugadores/detalle',
  eliminarJugador: 'jugadores/eliminar',
  suspenderActivar: 'jugadores/suspender-activar',
  desvincularJugadorDelEquipo: 'jugadores/desvincular-del-equipo',
  aprobarRechazarJugador: 'jugadores/aprobar-rechazar',
  cambiarEstadoJugador: 'jugadores/cambiar-estado',
  torneos: 'torneos',
  agrupadoresTorneo: 'torneos/agrupadores',
  crearAgrupadorTorneo: 'torneos/agrupadores/crear',
  editarAgrupadorTorneo: 'torneos/agrupadores/editar',
  crearTorneo: 'torneos/crear',
  detalleTorneo: 'torneos/detalle',
  reportes: 'reportes',
  reportePagos: 'reportes/pagos',
  delegados: 'delegados',
  detalleDelegado: 'delegados/detalle',
  eliminarDelegado: 'delegados/eliminar',
  aprobarRechazarDelegado: 'delegados/aprobar-rechazar',
  configuracion: 'configuracion',
  generacionDeFixtures: 'configuracion/generacion-de-fixtures',
  fechasGeneracionFixture: 'configuracion/generacion-de-fixtures/fechas'
}

export const rutasNavegacion: { [K in keyof typeof rutas]: string } =
  Object.fromEntries(
    Object.entries(rutas).map(([key, value]) => [key, `/${value}`])
  ) as { [K in keyof typeof rutas]: string }
