export function formatearDiaCorto(fecha: Date): string {
  const dia = fecha.getUTCDate()
  const mes = fecha.getUTCMonth() + 1
  return `${dia}/${mes}`
}

export function mismaFechaCalendario(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

export function nombreCompletoArbitro(
  nombre: string | undefined,
  apellido: string | undefined
): string {
  return [apellido, nombre].filter(Boolean).join(', ')
}

export function normalizarTextoBusqueda(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

export function coincideBusquedaArbitro(
  nombre: string | undefined,
  apellido: string | undefined,
  busqueda: string
): boolean {
  const q = normalizarTextoBusqueda(busqueda)
  if (!q) return true
  const completo = normalizarTextoBusqueda(
    nombreCompletoArbitro(nombre, apellido)
  )
  const soloNombre = normalizarTextoBusqueda(nombre ?? '')
  const soloApellido = normalizarTextoBusqueda(apellido ?? '')
  return (
    completo.includes(q) || soloNombre.includes(q) || soloApellido.includes(q)
  )
}

export function jornadaTieneAsignacion(
  arbitro1Id: string,
  arbitro2Id: string
): boolean {
  return arbitro1Id !== 'sin-arbitro' || arbitro2Id !== 'sin-arbitro'
}
