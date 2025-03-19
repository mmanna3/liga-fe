export const rutas = {
  clubs: 'clubs',
  crearClub: 'clubs/crear',
  detalleClub: 'clubs/detalle',
  equipos: 'equipos',
  crearEquipo: 'equipos/crear',
  editarEquipo: 'equipos/editar',
  detalleEquipo: 'equipos/detalle',
  cambioEstadoMasivoEquipo: 'equipos/cambio-estado-masivo',
  jugadores: 'jugadores',
  detalleJugador: 'jugadores/detalle',
  aprobarRechazarJugador: 'jugadores/aprobar-rechazar',
  cambiarEstadoJugador: 'jugadores/cambiar-estado',
  torneos: 'torneos',
  crearTorneo: 'torneos/crear',
  detalleTorneo: 'torneos/detalle',
  reportes: 'reportes',
  reportePagos: 'reportes/pagos',
  delegados: 'delegados',
  crearDelegado: 'delegados/crear',
  detalleDelegado: 'delegados/detalle',
  blanquearClaveDelegado: 'delegados/blanquear-clave'
}

export const rutasNavegacion: { [K in keyof typeof rutas]: string } =
  Object.fromEntries(
    Object.entries(rutas).map(([key, value]) => [key, `/admin/${value}`])
  ) as { [K in keyof typeof rutas]: string }
