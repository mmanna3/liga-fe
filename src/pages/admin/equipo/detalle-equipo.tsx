import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import { EstadoJugador } from '@/lib/utils'
import { jsPDF } from 'jspdf'
import { FileDown } from 'lucide-react'
import { useParams } from 'react-router-dom'

const estadoConfig = {
  [EstadoJugador.FichajePendienteDeAprobacion]: {
    texto: 'Pendiente de aprobación',
    color: 'bg-sky-600 text-slate-200'
  },
  [EstadoJugador.FichajeRechazado]: {
    texto: 'Fichaje rechazado',
    color: 'bg-rose-600 text-slate-200'
  },
  [EstadoJugador.Activo]: {
    texto: 'Activo',
    color: 'bg-emerald-600 text-slate-200'
  },
  [EstadoJugador.Suspendido]: {
    texto: 'Suspendido',
    color: 'bg-amber-600 text-slate-200'
  },
  [EstadoJugador.Inhabilitado]: {
    texto: 'Inhabilitado',
    color: 'bg-gray-600 text-slate-200'
  },
  [EstadoJugador.AprobadoPendienteDePago]: {
    texto: 'Aprobado pendiente de pago',
    color: 'bg-teal-600 text-slate-200'
  }
}

export default function DetalleEquipo() {
  const { id } = useParams<{ id: string }>()

  const {
    data: equipo,
    isError,
    isLoading
  } = useApiQuery({
    key: ['equipo', id],
    fn: async () => await api.equipoGET(Number(id))
  })

  const generarReportePDF = async () => {
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

      // Obtener el motivo del jugador
      let motivo = ''
      if (jugador.id) {
        try {
          const jugadorDetalle = await api.jugadorGET(jugador.id)
          const equipoJugador = jugadorDetalle.equipos?.find(
            (e) => e.id === jugador.jugadorEquipoId
          )
          motivo = equipoJugador?.motivo || ''
        } catch (error) {
          console.error('Error al obtener detalles del jugador:', error)
        }
      }

      // Dibujar celdas
      const cellValues = [
        jugador.dni || '',
        jugador.nombre || '',
        jugador.apellido || '',
        estadoDescripcion,
        motivo
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

  if (isError) {
    return (
      <Alert variant='destructive' className='mb-4'>
        <AlertTitle className='text-xl font-semibold'>Error</AlertTitle>
        <AlertDescription>
          No se pudieron recuperar los datos del equipo.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className='max-w-md mx-auto mt-10'>
        <Skeleton className='h-16 w-64' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
      </div>
    )
  }

  return (
    <Card className='max-w-2lg mx-auto mt-10 p-4'>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>{equipo!.nombre}</CardTitle>
        <Button
          onClick={generarReportePDF}
          variant='outline'
          className='flex items-center gap-2'
        >
          <FileDown className='h-4 w-4' />
          Generar Reporte PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div className='mb-4 space-y-2'>
          <DetalleItem clave='Club' valor={equipo!.clubNombre!} />
          <DetalleItem
            clave='Torneo'
            valor={equipo!.torneoNombre || 'No asignado'}
          />
          <DetalleItem clave='Código' valor={equipo!.codigoAlfanumerico!} />
        </div>
        <h2 className='text-md font-bold'>Jugadores</h2>
        <ul className='list-disc list-inside'>
          {equipo!.jugadores!.map((jug) => (
            <li key={jug.id} className='my-1'>
              {jug.nombre} {jug.apellido} - {jug.dni}{' '}
              <span className='ml-2'>
                <JugadorEquipoEstadoBadge estado={Number(jug.estado)} />
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <Botonera>
        <BotonVolver texto='Volver' />
      </Botonera>
    </Card>
  )
}
