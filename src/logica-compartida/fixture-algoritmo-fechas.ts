type FechaOrdenable = {
  fecha: number
  orden?: number
  id?: number
}

export function compararFixtureAlgoritmoFechas(
  a: FechaOrdenable,
  b: FechaOrdenable
): number {
  if (a.fecha !== b.fecha) return a.fecha - b.fecha
  const ordenA = a.orden ?? a.id ?? 0
  const ordenB = b.orden ?? b.id ?? 0
  return ordenA - ordenB
}

export function ordenarFixtureAlgoritmoFechas<T extends FechaOrdenable>(
  fechas: T[]
): T[] {
  return [...fechas].sort(compararFixtureAlgoritmoFechas)
}
