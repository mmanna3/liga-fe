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

export function obtenerRangoAnios(anioActual: number): number[] {
  const desde = anioActual - 20
  const hasta = anioActual + 1
  const anios: number[] = []
  for (let a = hasta; a >= desde; a--) anios.push(a)
  return anios
}

export function nombreCompletoArbitro(
  nombre: string | undefined,
  apellido: string | undefined
): string {
  return [apellido, nombre].filter(Boolean).join(', ')
}
