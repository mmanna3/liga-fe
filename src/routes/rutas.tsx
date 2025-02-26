export const rutas = {
  clubs: 'clubs',
  crearClub: 'clubs/crear',
  detalleClub: 'clubs/detalle',
  equipos: 'equipos',
  crearEquipo: 'equipos/crear',
  detalleEquipo: 'equipos/detalle',
  jugadores: 'jugadores',
  detalleJugador: 'jugadores/detalle'
}

export const rutasNavegacion: { [K in keyof typeof rutas]: string } =
  Object.fromEntries(
    Object.entries(rutas).map(([key, value]) => [key, `/admin/${value}`])
  ) as { [K in keyof typeof rutas]: string }
