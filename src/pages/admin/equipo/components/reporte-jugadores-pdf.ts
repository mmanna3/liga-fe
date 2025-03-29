import { EquipoDTO } from '@/api/clients'
import { estadoConfig } from '@/components/ykn-ui/jugador-equipo-estado-badge'
import { EstadoJugador } from '@/lib/utils'
import { jsPDF } from 'jspdf'

export const generarReportePDF = async (equipo: EquipoDTO) => {
  if (!equipo?.jugadores) return

  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(`Reporte de Jugadores - ${equipo.nombre}`, 14, 15)
  doc.setFontSize(12)
  doc.text(`Club: ${equipo.clubNombre}`, 14, 25)
  doc.text(`Torneo: ${equipo.torneoNombre || 'No asignado'}`, 14, 35)
  doc.text(`Código: ${equipo.codigoAlfanumerico}`, 14, 45)

  // Configuración de la tabla
  const startY = 55
  const lineHeight = 10
  const fontSize = 10
  doc.setFontSize(fontSize)

  // Encabezados
  const headers = ['DNI', 'Nombre', 'Apellido', 'Estado', 'Motivo']
  const columnWidths = [25, 35, 35, 50, 35]

  // Función para dividir texto en múltiples líneas
  const splitText = (text: string, maxWidth: number): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const width = doc.getTextWidth(currentLine + ' ' + words[i])
      if (width < maxWidth) {
        currentLine += ' ' + words[i]
      } else {
        lines.push(currentLine)
        currentLine = words[i]
      }
    }
    lines.push(currentLine)
    return lines
  }

  // Dibujar encabezados
  let x = 14
  headers.forEach((header, index) => {
    doc.setFillColor(0, 100, 0) // Verde más oscuro
    doc.rect(x, startY, columnWidths[index], lineHeight, 'F')
    doc.setTextColor(255, 255, 255)
    doc.text(header, x + 2, startY + 7)
    x += columnWidths[index]
  })

  // Dibujar líneas de la tabla
  let currentY = startY + lineHeight

  // Ordenar jugadores: primero los rechazados, luego por DNI
  const jugadoresOrdenados = [...equipo.jugadores].sort((a, b) => {
    // Primero ordenar por estado (rechazados primero)
    const estadoA = Number(a.estado)
    const estadoB = Number(b.estado)
    if (
      estadoA === EstadoJugador.FichajeRechazado &&
      estadoB !== EstadoJugador.FichajeRechazado
    )
      return -1
    if (
      estadoA !== EstadoJugador.FichajeRechazado &&
      estadoB === EstadoJugador.FichajeRechazado
    )
      return 1

    // Si tienen el mismo estado, ordenar por DNI
    const dniA = parseInt(a.dni || '999999999')
    const dniB = parseInt(b.dni || '999999999')
    return dniA - dniB
  })

  for (let i = 0; i < jugadoresOrdenados.length; i++) {
    const jugador = jugadoresOrdenados[i]
    x = 14

    // Obtener la descripción del estado
    const estado = Number(jugador.estado) as EstadoJugador
    const estadoDescripcion = estadoConfig[estado]?.texto || 'Desconocido'

    // Dibujar celdas
    const cellValues = [
      jugador.dni || '',
      jugador.nombre || '',
      jugador.apellido || '',
      estadoDescripcion,
      jugador.motivo
    ]

    // Calcular la altura necesaria para esta fila
    let maxLines = 1
    cellValues.forEach((value, index) => {
      if (value) {
        const lines = splitText(value, columnWidths[index] - 4)
        maxLines = Math.max(maxLines, lines.length)
      }
    })

    // Dibujar las celdas con altura ajustada
    cellValues.forEach((value, index) => {
      doc.setTextColor(0, 0, 0)
      doc.rect(x, currentY, columnWidths[index], lineHeight * maxLines)

      if (value) {
        const lines = splitText(value, columnWidths[index] - 4)
        lines.forEach((line, lineIndex) => {
          // Usar un espaciado más pequeño para líneas múltiples
          const lineSpacing = index === 4 ? 8 : lineHeight // 8 para Motivo, lineHeight para otros campos
          doc.text(line, x + 2, currentY + 7 + lineIndex * lineSpacing)
        })
      }

      x += columnWidths[index]
    })

    currentY += lineHeight * maxLines
  }

  doc.save(`reporte-jugadores-${equipo.nombre}.pdf`)
}
