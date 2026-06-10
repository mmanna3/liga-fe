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
}

export function construirMensajeWhatsappArbitro(
  datos: DatosMensajeWhatsappArbitro
): string {
  const diaTexto = formatearDiaMensajeWhatsapp(datos.dia, datos.diaSemana)
  const ubicacion = [datos.direccionLocal, datos.localidadLocal]
    .filter(Boolean)
    .join(', ')
  const parteUbicacion = ubicacion ? ` en *${ubicacion}*` : ''

  return (
    `Hola ${datos.nombre} ${datos.apellido}, tu próxima jornada es ` +
    `*${datos.local} vs ${datos.visitante}* del ` +
    `*Torneo ${datos.torneoNombre} - ${datos.faseNombre} - ${datos.zonaNombre}* ` +
    `el día ${diaTexto} en el Club ${datos.nombreClubLocal}${parteUbicacion}.`
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
