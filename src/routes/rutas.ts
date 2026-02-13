export const rutas = {
  clubs: 'clubs',
  crearClub: 'clubs/crear',
  detalleClub: 'clubs/detalle',
  equipos: 'equipos',
  crearEquipo: 'equipos/crear',
  editarEquipo: 'equipos/editar',
  detalleEquipo: 'equipos/detalle',
  cambioEstadoMasivoEquipo: 'equipos/cambio-estado-masivo',
  pases: 'equipos/pases',
  jugadores: 'jugadores',
  detalleJugador: 'jugadores/detalle',
  eliminarJugador: 'jugadores/eliminar',
  suspenderActivar: 'jugadores/suspender-activar',
  desvincularJugadorDelEquipo: 'jugadores/desvincular-del-equipo',
  aprobarRechazarJugador: 'jugadores/aprobar-rechazar',
  cambiarEstadoJugador: 'jugadores/cambiar-estado',
  torneos: 'torneos',
  torneosHome: 'torneos/home',
  crearTorneo: 'torneos/crear',
  detalleTorneo: 'torneos/detalle',
  torneosInformacion: 'torneos/informacion',
  reportes: 'reportes',
  reportePagos: 'reportes/pagos',
  delegados: 'delegados',
  crearDelegado: 'delegados/crear',
  detalleDelegado: 'delegados/detalle',
  blanquearClaveDelegado: 'delegados/blanquear-clave',
  eliminarDelegado: 'delegados/eliminar',
  configuracion: 'configuracion'
}

export const rutasNavegacion: { [K in keyof typeof rutas]: string } =
  Object.fromEntries(
    Object.entries(rutas).map(([key, value]) => [key, `/admin/${value}`])
  ) as { [K in keyof typeof rutas]: string }
