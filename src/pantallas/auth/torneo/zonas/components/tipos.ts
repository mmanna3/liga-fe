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

export interface ValidarZonasOpciones {
  /** En eliminación directa el mismo equipo puede estar en varias zonas de la fase. */
  permitirEquiposRepetidosEntreZonas?: boolean
}

/** Agrega un equipo a una zona respetando las reglas de unicidad por tipo de fase. */
export function aplicarAgregarEquipoAZona(
  zonas: ZonaEstado[],
  index: number,
  equipo: EquipoDTO,
  opciones: ValidarZonasOpciones = {}
): ZonaEstado[] {
  const permitirRepetidos = opciones.permitirEquiposRepetidosEntreZonas ?? false
  const equipoId = equipo.id
  if (equipoId == null || zonas[index] == null) return zonas

  if (zonas[index].equipos.some((e) => e.id === equipoId)) return zonas

  let zonasActualizadas = zonas
  if (!permitirRepetidos) {
    const indiceOrigen = zonas.findIndex(
      (z, i) => i !== index && z.equipos.some((e) => e.id === equipoId)
    )
    if (indiceOrigen >= 0) {
      zonasActualizadas = zonasActualizadas.map((z, i) =>
        i === indiceOrigen
          ? { ...z, equipos: z.equipos.filter((e) => e.id !== equipoId) }
          : z
      )
    }
  }

  return zonasActualizadas.map((z, i) =>
    i === index ? { ...z, equipos: [...z.equipos, equipo] } : z
  )
}

/** Valida que las zonas puedan guardarse: nombres únicos y equipos únicos entre zonas (TCT). */
export function validarZonasParaGuardar(
  zonas: ZonaEstado[],
  opciones: ValidarZonasOpciones = {}
): ValidacionZonasResultado {
  const nombres = zonas.map((z) => z.nombre?.trim().toLowerCase() ?? '')
  const nombresUnicos = new Set(nombres)
  if (nombres.length !== nombresUnicos.size) {
    return {
      valido: false,
      mensaje: 'No puede haber dos zonas con el mismo nombre.'
    }
  }

  if (!opciones.permitirEquiposRepetidosEntreZonas) {
    const equiposVistos = new Set<number>()
    for (const zona of zonas) {
      for (const equipo of zona.equipos) {
        if (equipo.id == null) continue
        if (equiposVistos.has(equipo.id)) {
          return {
            valido: false,
            mensaje:
              'No puede haber equipos repetidos entre zonas de la misma fase.'
          }
        }
        equiposVistos.add(equipo.id)
      }
    }
  }

  return { valido: true }
}
