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
