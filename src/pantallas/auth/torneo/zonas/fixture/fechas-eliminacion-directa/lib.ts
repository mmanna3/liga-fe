import type { FechaEliminacionDirectaDTO } from '@/api/clients'

/**
 * Zona de un único equipo: el fixture es solo la Final con una jornada libre.
 * No se juega: el equipo es campeón directo.
 */
export function campeonSinJugarDeFechas(
  fechas: FechaEliminacionDirectaDTO[]
): { fecha: FechaEliminacionDirectaDTO; equipo: string } | null {
  if (fechas.length !== 1) return null
  const fecha = fechas[0]
  if (fecha.instanciaId !== 2 || fecha.jornadas?.length !== 1) return null
  const jornada = fecha.jornadas?.[0]
  if (jornada?.tipo !== 'Libre') return null
  return { fecha, equipo: jornada.equipo ?? '—' }
}
