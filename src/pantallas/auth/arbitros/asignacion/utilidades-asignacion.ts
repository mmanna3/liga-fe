import type {
  AsignacionHistoricaArbitrosPorAgrupadorDTO,
  FechaHistoricaAsignacionDTO,
  FaseCategoriaDTO,
  JornadaAsignacionDTO,
  TorneoAsignacionHistoricaDTO
} from '@/api/clients'

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

export function formatearDiaMensajeWhatsapp(
  fecha: Date,
  diaSemana: string
): string {
  const mes = fecha.toLocaleDateString('es-AR', {
    month: 'long',
    timeZone: 'UTC'
  })
  const dia = fecha.getUTCDate()
  return `${diaSemana.toLowerCase()} ${dia} de ${mes}`
}

export function telefonoParaWaMe(telefono?: string | null): string | null {
  if (!telefono?.trim()) return null
  const digitos = telefono.replace(/\D/g, '')
  return digitos.length >= 10 ? digitos : null
}

export function horarioParaInput(val?: string | null): string {
  if (!val?.trim()) return ''
  return val.slice(0, 5)
}

export function claveCategoriaFase(categoria: {
  id?: number
  nombre: string
  orden: number
}): string {
  return categoria.id != null
    ? String(categoria.id)
    : `${categoria.nombre}-${categoria.orden}`
}

export function etiquetaCategoriaFase(categoria: {
  nombre: string
  anioDesde: number
  anioHasta: number
}): string {
  return categoria.nombre
}

export interface DatosMensajeWhatsappArbitro {
  nombre: string
  apellido: string
  local: string
  visitante: string
  torneoNombre: string
  faseNombre: string
  zonaNombre: string
  dia: Date
  diaSemana: string
  nombreClubLocal: string
  direccionLocal?: string | null
  localidadLocal?: string | null
  horarioInicio?: string
  categoriasSeleccionadas?: string[]
  observaciones?: string
}

function construirUrlGoogleMaps(
  direccion?: string | null,
  localidad?: string | null
): string | null {
  const consulta = [direccion, localidad].filter(Boolean).join(', ')
  if (!consulta) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`
}

export function construirMensajeWhatsappArbitro(
  datos: DatosMensajeWhatsappArbitro
): string {
  const diaTexto = formatearDiaMensajeWhatsapp(datos.dia, datos.diaSemana)
  const horario = datos.horarioInicio?.trim()
    ? horarioParaInput(datos.horarioInicio)
    : ''
  const parteHorario = horario ? ` a las *${horario}*` : ''
  const ubicacion = [datos.direccionLocal, datos.localidadLocal]
    .filter(Boolean)
    .join(', ')
  const parteUbicacion = ubicacion ? ` en *${ubicacion}*` : ''
  const urlMaps = construirUrlGoogleMaps(
    datos.direccionLocal,
    datos.localidadLocal
  )
  const parteMaps = urlMaps ? `\n\n>> Link Google Maps:\n${urlMaps}` : ''
  const parteCategorias =
    datos.categoriasSeleccionadas && datos.categoriasSeleccionadas.length > 0
      ? `\nCategorías a dirigir: *${datos.categoriasSeleccionadas.join(', ')}*`
      : ''
  const parteObservaciones = datos.observaciones?.trim()
    ? `\n\n*Observaciones:* ${datos.observaciones.trim()}`
    : ''

  return (
    `Hola ${datos.nombre} ${datos.apellido}, tu próxima jornada es ` +
    `*${datos.local} vs ${datos.visitante}* del ` +
    `*Torneo ${datos.torneoNombre} - ${datos.faseNombre} - ${datos.zonaNombre}*.\n` +
    `El día ${diaTexto}${parteHorario} en el Club ${datos.nombreClubLocal}${parteUbicacion}.${parteCategorias}${parteObservaciones}${parteMaps}` +
    `\n\n--\nEDeFI Administración`
  )
}

export function construirUrlWhatsapp(
  telefono: string,
  mensaje: string
): string {
  const numero = telefonoParaWaMe(telefono)
  if (!numero) return ''
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}

export function claveWhatsappJornadaArbitro(
  jornadaId: number,
  arbitroId: number
): string {
  return `${jornadaId}-${arbitroId}`
}

export interface DatosWhatsappEnviadoArbitro {
  horarioInicio: string
  observaciones: string
  categorias: { id: number; nombre: string }[]
}

export function formatearDetalleWhatsappHistorico(
  whatsapp?: {
    enviado?: boolean
    horarioInicio?: string | null
    observaciones?: string | null
    categoriasNombres?: string[] | null
    enviadoEn?: Date | null
  } | null
): string[] {
  if (!whatsapp?.enviado) return []

  const lineas: string[] = []
  const categorias = (whatsapp.categoriasNombres ?? []).filter(Boolean)
  if (categorias.length > 0) {
    lineas.push(`Categorías: ${categorias.join(', ')}`)
  }
  if (whatsapp.horarioInicio?.trim()) {
    lineas.push(`Horario: ${horarioParaInput(whatsapp.horarioInicio)}`)
  }
  if (whatsapp.observaciones?.trim()) {
    lineas.push(`Observaciones: ${whatsapp.observaciones.trim()}`)
  }
  if (whatsapp.enviadoEn) {
    lineas.push(
      `Enviado: ${whatsapp.enviadoEn.toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short'
      })}`
    )
  }
  return lineas
}

export function obtenerRangoAniosArbitros(anioActual: number): number[] {
  const desde = anioActual - 20
  const hasta = anioActual + 1
  const anios: number[] = []
  for (let a = hasta; a >= desde; a--) anios.push(a)
  return anios
}

export interface OpcionFechaHistorica {
  value: string
  label: string
  zonaNombre: string
  faseNombre: string
  faseId: number
  zonaId: number
  fecha: FechaHistoricaAsignacionDTO
}

export interface ContextoFechaHistorica {
  torneo: TorneoAsignacionHistoricaDTO
  faseNombre: string
  faseId: number
  zonaNombre: string
  zonaId: number
  fecha: FechaHistoricaAsignacionDTO
  jornadas: JornadaAsignacionDTO[]
  categoriasFase: FaseCategoriaDTO[]
  horarioDeJuegoTorneo?: string | null
}

function etiquetaFechaHistorica(
  fecha: FechaHistoricaAsignacionDTO,
  zonaNombre: string
): string {
  const partes = [
    fecha.numero != null ? `Fecha ${fecha.numero}` : fecha.instanciaNombre,
    fecha.diaSemana,
    fecha.dia ? formatearDiaCorto(fecha.dia) : null,
    zonaNombre
  ].filter(Boolean)
  return partes.join(' · ')
}

export function construirOpcionesFechasHistoricas(
  torneo: TorneoAsignacionHistoricaDTO
): OpcionFechaHistorica[] {
  const opciones: OpcionFechaHistorica[] = []

  for (const fase of torneo.fases ?? []) {
    const faseNombre = fase.nombre ?? `Fase ${fase.id}`
    for (const zona of fase.zonas ?? []) {
      const zonaNombre = zona.nombre ?? `Zona ${zona.id}`
      for (const fecha of zona.fechasHistoricas ?? []) {
        opciones.push({
          value: String(fecha.fechaId),
          label: etiquetaFechaHistorica(fecha, zonaNombre),
          zonaNombre,
          faseNombre,
          faseId: fase.id!,
          zonaId: zona.id!,
          fecha
        })
      }
    }
  }

  return opciones.sort((a, b) => {
    const diaA = a.fecha.dia ? new Date(a.fecha.dia).getTime() : 0
    const diaB = b.fecha.dia ? new Date(b.fecha.dia).getTime() : 0
    return diaB - diaA
  })
}

export function obtenerContextoFechaHistorica(
  data: AsignacionHistoricaArbitrosPorAgrupadorDTO,
  torneoId: number,
  fechaId: number
): ContextoFechaHistorica | null {
  const torneo = (data.torneos ?? []).find((t) => t.id === torneoId)
  if (!torneo) return null

  for (const fase of torneo.fases ?? []) {
    const faseNombre = fase.nombre ?? `Fase ${fase.id}`
    for (const zona of fase.zonas ?? []) {
      const zonaNombre = zona.nombre ?? `Zona ${zona.id}`
      const fecha = (zona.fechasHistoricas ?? []).find(
        (f) => f.fechaId === fechaId
      )
      if (!fecha) continue

      return {
        torneo,
        faseNombre,
        faseId: fase.id!,
        zonaNombre,
        zonaId: zona.id!,
        fecha,
        jornadas: fecha.jornadas ?? [],
        categoriasFase: fase.categorias ?? [],
        horarioDeJuegoTorneo: torneo.horarioDeJuego
      }
    }
  }

  return null
}

export function obtenerJornadaIdsDeFecha(
  data: AsignacionHistoricaArbitrosPorAgrupadorDTO,
  torneoId: number,
  fechaId: number
): Set<number> {
  const contexto = obtenerContextoFechaHistorica(data, torneoId, fechaId)
  if (!contexto) return new Set()
  return new Set(contexto.jornadas.map((j) => j.id!))
}

export function construirSlotsInicialesDesdeJornadas(
  jornadas: JornadaAsignacionDTO[]
): Record<number, { arbitro1: string; arbitro2: string }> {
  const slots: Record<number, { arbitro1: string; arbitro2: string }> = {}
  for (const jornada of jornadas) {
    const asignados = [...(jornada.arbitrosAsignados ?? [])].sort(
      (a, b) => a.orden - b.orden
    )
    slots[jornada.id!] = {
      arbitro1: asignados[0] ? String(asignados[0].id) : 'sin-arbitro',
      arbitro2: asignados[1] ? String(asignados[1].id) : 'sin-arbitro'
    }
  }
  return slots
}

export function idsDesdeSlots(arbitro1: string, arbitro2: string): number[] {
  const ids: number[] = []
  if (arbitro1 !== 'sin-arbitro') ids.push(Number(arbitro1))
  if (arbitro2 !== 'sin-arbitro' && arbitro2 !== arbitro1)
    ids.push(Number(arbitro2))
  return ids
}

export type TipoAdvertenciaArbitro =
  | 'conflicto_fecha'
  | 'equipo_prohibido'
  | 'dirigio_reciente'

export interface AdvertenciaArbitro {
  tipo: TipoAdvertenciaArbitro
  titulo: string
  detalle?: string
}

export const ETIQUETA_TIPO_ADVERTENCIA_ARBITRO: Record<
  TipoAdvertenciaArbitro,
  string
> = {
  conflicto_fecha: 'Conflicto de fecha',
  equipo_prohibido: 'Equipo prohibido',
  dirigio_reciente: 'Historial reciente'
}

export function claveAdvertenciaArbitro(
  advertencia: AdvertenciaArbitro
): string {
  return `${advertencia.tipo}:${advertencia.titulo}:${advertencia.detalle ?? ''}`
}

export function formatearEtiquetaFechaAsignacion(
  fechaNumero?: number | null,
  instanciaNombre?: string | null
): string {
  if (fechaNumero != null) return String(fechaNumero)
  if (instanciaNombre) return instanciaNombre
  return '?'
}
