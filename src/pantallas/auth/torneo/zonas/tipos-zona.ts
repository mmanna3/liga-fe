import { EquipoDeLaZonaDTO, EquipoDTO, TorneoZonaDTO } from '@/api/clients'

/** Estado de una zona en la UI (usa EquipoDTO para compatibilidad con el buscador) */
export interface ZonaEstado {
  id?: number
  nombre: string
  equipos: EquipoDTO[]
}

/** Convierte TorneoZonaDTO del API a ZonaEstado para la UI */
export function zonaDtoAEstado(dto: TorneoZonaDTO): ZonaEstado {
  const equipos = (dto.equipos ?? []).map((e) => ({
    id: e.id ? parseInt(e.id, 10) : undefined,
    codigoAlfanumerico: e.codigo,
    nombre: e.nombre,
    clubNombre: e.club
  })) as EquipoDTO[]
  return {
    id: dto.id,
    nombre: dto.nombre ?? 'Zona',
    equipos
  }
}

/** Convierte ZonaEstado de la UI a TorneoZonaDTO para el API */
export function zonaEstadoADto(
  zona: ZonaEstado,
  torneoFaseId: number
): TorneoZonaDTO {
  const equipos = zona.equipos.map(
    (e) =>
      new EquipoDeLaZonaDTO({
        id: e.id != null ? String(e.id) : undefined,
        codigo: e.codigoAlfanumerico,
        nombre: e.nombre,
        club: e.clubNombre
      })
  )
  return new TorneoZonaDTO({
    id: zona.id,
    nombre: zona.nombre,
    torneoFaseId,
    equipos
  })
}
