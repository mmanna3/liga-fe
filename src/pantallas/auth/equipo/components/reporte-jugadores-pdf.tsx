import { EquipoDTO, JugadorDelEquipoDTO } from '@/api/clients'
import { estadoConfig } from '@/design-system/ykn-ui/jugador-equipo-estado-badge'
import { EstadoJugador } from '@/logica-compartida/utils'
import roboto400 from '@fontsource/roboto/files/roboto-latin-400-normal.woff?url'
import roboto600 from '@fontsource/roboto/files/roboto-latin-600-normal.woff?url'
import {
  Document,
  Font,
  Page,
  pdf,
  StyleSheet,
  Text,
  View
} from '@react-pdf/renderer'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: roboto400, fontWeight: 400 },
    { src: roboto600, fontWeight: 600 }
  ]
})

Font.registerHyphenationCallback((word) => [word])

const VERDE_HEADER = '#006400'
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10
  },
  titulo: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8
  },
  info: {
    fontSize: 12,
    marginBottom: 4
  },
  tabla: {
    marginTop: 20
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: VERDE_HEADER
  },
  headerCell: {
    padding: 8,
    fontWeight: 600,
    fontSize: 10
  },
  headerText: {
    color: 'white'
  },
  bodyRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc'
  },
  bodyCell: {
    padding: 6,
    fontSize: 9
  }
})

const COL_WIDTHS = [50, 70, 70, 100, 70] as const

function obtenerEstadoDescripcion(estado: number): string {
  return estadoConfig[estado as EstadoJugador]?.texto ?? 'Desconocido'
}

function ordenarJugadores(
  jugadores: JugadorDelEquipoDTO[]
): JugadorDelEquipoDTO[] {
  return [...jugadores].sort((a, b) => {
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
    const dniA = parseInt(a.dni || '999999999')
    const dniB = parseInt(b.dni || '999999999')
    return dniA - dniB
  })
}

function ReporteJugadoresDocument({ equipo }: { equipo: EquipoDTO }) {
  const jugadores = equipo.jugadores ?? []
  const jugadoresOrdenados = ordenarJugadores(jugadores)

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <Text style={styles.titulo}>
          Reporte de Jugadores - {equipo.nombre}
        </Text>
        <Text style={styles.info}>Club: {equipo.clubNombre}</Text>
        <Text style={styles.info}>
          Torneo excluyente:{' '}
          {equipo.zonaExcluyente
            ? [
                equipo.zonaExcluyente.torneo,
                equipo.zonaExcluyente.fase,
                equipo.zonaExcluyente.nombre
              ]
                .filter(Boolean)
                .join(' · ')
            : 'No asignado'}
        </Text>
        <Text style={styles.info}>
          Otros torneos:{' '}
          {equipo.zonasNoExcluyentes?.length
            ? [
                ...new Set(
                  equipo.zonasNoExcluyentes.map((z) => z.torneo).filter(Boolean)
                )
              ].join(', ') || '-'
            : '-'}
        </Text>
        <Text style={styles.info}>Código: {equipo.codigoAlfanumerico}</Text>

        <View style={styles.tabla}>
          <View style={styles.headerRow}>
            <View
              style={[styles.headerCell, { flex: 1, minWidth: COL_WIDTHS[0] }]}
            >
              <Text style={styles.headerText}>DNI</Text>
            </View>
            <View
              style={[styles.headerCell, { flex: 1, minWidth: COL_WIDTHS[1] }]}
            >
              <Text style={styles.headerText}>Nombre</Text>
            </View>
            <View
              style={[styles.headerCell, { flex: 1, minWidth: COL_WIDTHS[2] }]}
            >
              <Text style={styles.headerText}>Apellido</Text>
            </View>
            <View
              style={[styles.headerCell, { flex: 1, minWidth: COL_WIDTHS[3] }]}
            >
              <Text style={styles.headerText}>Estado</Text>
            </View>
            <View
              style={[styles.headerCell, { flex: 1, minWidth: COL_WIDTHS[4] }]}
            >
              <Text style={styles.headerText}>Motivo</Text>
            </View>
          </View>
          {jugadoresOrdenados.map((jugador) => (
            <View key={jugador.id ?? jugador.dni} style={styles.bodyRow}>
              <View
                style={[styles.bodyCell, { flex: 1, minWidth: COL_WIDTHS[0] }]}
              >
                <Text>{jugador.dni || ''}</Text>
              </View>
              <View
                style={[styles.bodyCell, { flex: 1, minWidth: COL_WIDTHS[1] }]}
              >
                <Text>{jugador.nombre || ''}</Text>
              </View>
              <View
                style={[styles.bodyCell, { flex: 1, minWidth: COL_WIDTHS[2] }]}
              >
                <Text>{jugador.apellido || ''}</Text>
              </View>
              <View
                style={[styles.bodyCell, { flex: 1, minWidth: COL_WIDTHS[3] }]}
              >
                <Text>{obtenerEstadoDescripcion(Number(jugador.estado))}</Text>
              </View>
              <View
                style={[styles.bodyCell, { flex: 1, minWidth: COL_WIDTHS[4] }]}
              >
                <Text>{jugador.motivo || ''}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}

export const generarReportePDF = async (equipo: EquipoDTO): Promise<void> => {
  if (!equipo?.jugadores?.length) return

  const blob = await pdf(<ReporteJugadoresDocument equipo={equipo} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte-jugadores-${equipo.nombre}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
