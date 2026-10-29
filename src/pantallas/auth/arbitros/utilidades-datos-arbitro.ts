import {
  FranjaHorariaArbitroEnum,
  TipoMovilidadArbitroEnum,
  type IArbitroDTO
} from '@/api/clients'

export const TEXTOS_TIPO_MOVILIDAD: Record<TipoMovilidadArbitroEnum, string> = {
  [TipoMovilidadArbitroEnum._1]: 'Moto',
  [TipoMovilidadArbitroEnum._2]: 'Auto',
  [TipoMovilidadArbitroEnum._3]: 'Bicicleta',
  [TipoMovilidadArbitroEnum._4]: 'Transporte público'
}

export const TEXTOS_FRANJA_HORARIA: Record<FranjaHorariaArbitroEnum, string> = {
  [FranjaHorariaArbitroEnum._1]: 'Sábados de 8 a 14',
  [FranjaHorariaArbitroEnum._2]: 'Sábados de 13 a 20',
  [FranjaHorariaArbitroEnum._3]: 'Domingos de 9 a 15',
  [FranjaHorariaArbitroEnum._4]: 'Domingos de 15 a 22',
  [FranjaHorariaArbitroEnum._5]: 'Martes a viernes de 20 a 23:30'
}

export const TIPOS_MOVILIDAD = Object.keys(TEXTOS_TIPO_MOVILIDAD).map(
  Number
) as TipoMovilidadArbitroEnum[]

export const FRANJAS_HORARIAS = Object.keys(TEXTOS_FRANJA_HORARIA).map(
  Number
) as FranjaHorariaArbitroEnum[]

const SIN_DATO = '—'

export function textoTipoMovilidad(tipo?: TipoMovilidadArbitroEnum): string {
  return tipo != null ? (TEXTOS_TIPO_MOVILIDAD[tipo] ?? SIN_DATO) : SIN_DATO
}

export function textosFranjasHorarias(
  franjas?: FranjaHorariaArbitroEnum[]
): string[] {
  return ordenarFranjas(franjas ?? []).map((f) => TEXTOS_FRANJA_HORARIA[f])
}

export function textoRelacionInstitucional(
  tiene?: boolean,
  institucion?: string
): string {
  if (tiene == null) return SIN_DATO
  if (!tiene) return 'No'
  return institucion?.trim() ? `Sí: ${institucion.trim()}` : 'Sí'
}

/** Las fechas del back llegan sin zona horaria y el cliente las parsea como hora local. */
export function textoFecha(fecha?: Date): string {
  return fecha ? fecha.toLocaleDateString('es-AR') : SIN_DATO
}

export function fechaParaInput(fecha?: Date): string {
  if (!fecha) return ''
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

/** Medianoche UTC, para que toISOString() no corra el día. */
export function fechaDesdeInput(valor: string): Date | undefined {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (!partes) return undefined
  const [, anio, mes, dia] = partes.map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia))
}

function ordenarFranjas(
  franjas: FranjaHorariaArbitroEnum[]
): FranjaHorariaArbitroEnum[] {
  return [...new Set(franjas)].sort((a, b) => a - b)
}

export interface DatosAdicionalesArbitro {
  direccion: string
  localidad: string
  /** yyyy-mm-dd, o vacío */
  fechaNacimiento: string
  tipoMovilidad?: TipoMovilidadArbitroEnum
  franjasHorarias: FranjaHorariaArbitroEnum[]
  tieneRelacionInstitucional?: boolean
  institucion: string
}

export function datosAdicionalesDesdeArbitro(
  arbitro?: IArbitroDTO
): DatosAdicionalesArbitro {
  return {
    direccion: arbitro?.direccion ?? '',
    localidad: arbitro?.localidad ?? '',
    fechaNacimiento: fechaParaInput(arbitro?.fechaNacimiento),
    tipoMovilidad: arbitro?.tipoMovilidad ?? undefined,
    franjasHorarias: ordenarFranjas(arbitro?.franjasHorarias ?? []),
    tieneRelacionInstitucional:
      arbitro?.tieneRelacionInstitucional ?? undefined,
    institucion: arbitro?.institucion ?? ''
  }
}

/**
 * El PUT del back pisa con vacío o null cualquier campo que no llegue,
 * así que hay que mandar siempre todos.
 */
export function datosAdicionalesParaBackend(
  datos: DatosAdicionalesArbitro
): Pick<
  IArbitroDTO,
  | 'direccion'
  | 'localidad'
  | 'fechaNacimiento'
  | 'tipoMovilidad'
  | 'franjasHorarias'
  | 'tieneRelacionInstitucional'
  | 'institucion'
> {
  return {
    direccion: datos.direccion.trim() || undefined,
    localidad: datos.localidad.trim() || undefined,
    fechaNacimiento: fechaDesdeInput(datos.fechaNacimiento),
    tipoMovilidad: datos.tipoMovilidad,
    franjasHorarias: ordenarFranjas(datos.franjasHorarias),
    tieneRelacionInstitucional: datos.tieneRelacionInstitucional,
    institucion: datos.tieneRelacionInstitucional
      ? datos.institucion.trim() || undefined
      : undefined
  }
}

export function mismosDatosAdicionales(
  a: DatosAdicionalesArbitro,
  b: DatosAdicionalesArbitro
): boolean {
  const normalizar = (d: DatosAdicionalesArbitro) => {
    const backend = datosAdicionalesParaBackend(d)
    return JSON.stringify({
      ...backend,
      fechaNacimiento: backend.fechaNacimiento?.toISOString()
    })
  }
  return normalizar(a) === normalizar(b)
}

export function validarDatosAdicionales(
  datos: DatosAdicionalesArbitro
): string | undefined {
  if (datos.tieneRelacionInstitucional && !datos.institucion.trim())
    return 'Indicá la institución'
  return undefined
}
