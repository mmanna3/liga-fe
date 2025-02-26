export const rutas = {
  clubs: 'clubs',
  crearClub: 'clubs/crear',
  equipos: 'equipos',
  crearEquipo: 'equipos/crear',
  jugadores: 'jugadores'
}

export const rutasNavegacion: { [K in keyof typeof rutas]: string } =
  Object.fromEntries(
    Object.entries(rutas).map(([key, value]) => [key, `/admin/${value}`])
  ) as { [K in keyof typeof rutas]: string }
