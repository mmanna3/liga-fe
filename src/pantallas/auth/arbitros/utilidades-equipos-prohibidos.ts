import type { ZonaResumenDTO } from '@/api/clients'

export function obtenerTorneosActualesDeEquipo(
  zonas: ZonaResumenDTO[] | undefined,
  anioActual: number
): string[] {
  const nombres = new Set<string>()
  for (const z of zonas ?? []) {
    if (z.anio === anioActual && z.torneo) {
      nombres.add(`${z.torneo} ${z.anio}`)
    }
  }
  return [...nombres].sort((a, b) => a.localeCompare(b, 'es'))
}

export function formatearLineaEquipoProhibido(
  codigo?: string | null,
  nombre?: string | null,
  club?: string | null
): string {
  const partes = [codigo, nombre].filter(Boolean)
  const principal = partes.join(' ')
  if (club) return `${principal} · ${club}`
  return principal || 'Equipo'
}
