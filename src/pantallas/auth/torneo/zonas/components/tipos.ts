import {
  EquipoDeLaZonaDTO,
  EquipoDTO,
  ZonaDTO,
  ZonaResumenDTO
} from '@/api/clients'

/** Estado de una zona en la UI (usa EquipoDTO para compatibilidad con el buscador) */
export interface ZonaEstado {
  id?: number
  nombre: string
  equipos: EquipoDTO[]
  /** Clave estable para DnD cuando la zona aún no tiene id de servidor. */
  clientKey?: string
}

/** Id estable para @dnd-kit (misma zona = mismo id aunque cambie el índice). */
export function idSortableZona(zona: ZonaEstado): string {
  if (zona.id != null) return `zona-${zona.id}`
  if (zona.clientKey != null) return zona.clientKey
  return `zona-legacy-${zona.nombre}-${zona.equipos.length}`
}

/** Convierte ZonaDTO del API a ZonaEstado para la UI */
export function zonaDtoAEstado(dto: ZonaDTO): ZonaEstado {
  const equipos = (dto.equipos ?? []).map(
    (e) =>
      new EquipoDTO({
        id: e.id ? parseInt(e.id, 10) : undefined,
        codigoAlfanumerico: e.codigo,
        nombre: e.nombre,
        clubNombre: e.club,
        clubId: 0,
        zonas: [
          new ZonaResumenDTO({
            id: dto.id,
            nombre: dto.nombre,
            anio: new Date().getFullYear()
          })
        ]
      })
  )
  return {
    id: dto.id,
    nombre: dto.nombre ?? 'Zona',
    equipos
  }
}

/** Convierte ZonaEstado de la UI a ZonaDTO para el API */
export function zonaEstadoADto(
  zona: ZonaEstado,
  faseId: number,
  orden: number
): ZonaDTO {
  const equipos = zona.equipos.map(
    (e) =>
      new EquipoDeLaZonaDTO({
        id: e.id != null ? String(e.id) : undefined,
        codigo: e.codigoAlfanumerico,
        nombre: e.nombre,
        club: e.clubNombre
      })
  )
  return new ZonaDTO({
    id: zona.id,
    nombre: zona.nombre,
    faseId,
    orden,
    equipos
  })
}

export interface ValidacionZonasResultado {
  valido: boolean
  mensaje?: string
}

/** Valida que las zonas puedan guardarse: todas con equipos y nombres únicos */
export function validarZonasParaGuardar(
  zonas: ZonaEstado[]
): ValidacionZonasResultado {
  const nombres = zonas.map((z) => z.nombre?.trim().toLowerCase() ?? '')
  const nombresUnicos = new Set(nombres)
  if (nombres.length !== nombresUnicos.size) {
    return {
      valido: false,
      mensaje: 'No puede haber dos zonas con el mismo nombre.'
    }
  }

  return { valido: true }
}
