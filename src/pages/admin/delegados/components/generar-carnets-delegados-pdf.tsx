import { DelegadoDTO } from '@/api/clients'
import {
  Document,
  Image,
  Page,
  pdf,
  StyleSheet,
  Text,
  View
} from '@react-pdf/renderer'

// Colores del diseño original Carnets.cshtml
const VERDE = '#01582e'
const AZUL = '#007bff'
const ROJO = '#e81f05'
const GRIS = '#b4b4b4'

const CARD_WIDTH = 68
const CARD_HEIGHT = 86
const CARDS_PER_ROW = 3
const MARGIN = 2
const GAP = 0
const IMG_SIZE = 34

const clubsDelegado = (d: DelegadoDTO): string =>
  d.delegadoClubs
    ?.map((dc) => dc.clubNombre)
    .filter(Boolean)
    .join(', ') ?? ''

const formatFechaNac = (d: DelegadoDTO): string => {
  const f = d.fechaNacimiento
  if (!f) return '-'
  const date = typeof f === 'string' ? new Date(f) : f
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const categoriaFromFecha = (d: DelegadoDTO): string => {
  const f = d.fechaNacimiento
  if (!f) return '-'
  const date = typeof f === 'string' ? new Date(f) : f
  const year = date.getFullYear()
  return `Cat ${year}`
}

/** Data URL con formato correcto. React-pdf requiere que image/png o image/jpeg coincida con los bytes reales. */
const toImageDataUrl = (fotoCarnet: string): string => {
  const raw = fotoCarnet.startsWith('data:')
    ? fotoCarnet.replace(/^data:image\/\w+;base64,/, '')
    : fotoCarnet
  // PNG empieza con iVBOR; JPEG con /9j/
  const format = raw.startsWith('iVBOR') ? 'png' : 'jpeg'
  return `data:image/${format};base64,${raw}`
}

const styles = StyleSheet.create({
  page: {
    padding: `${MARGIN}mm`,
    flexDirection: 'column',
    gap: `${GAP}mm`
  },
  row: {
    flexDirection: 'row',
    gap: `${GAP}mm`
  },
  card: {
    width: `${CARD_WIDTH}mm`,
    height: `${CARD_HEIGHT}mm`,
    borderWidth: 0.4,
    borderColor: VERDE,
    borderRadius: 4,
    padding: '5mm',
    fontFamily: 'Helvetica',
    alignItems: 'center'
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: VERDE,
    textAlign: 'center',
    marginBottom: 1
  },
  subtitulo: {
    fontSize: 5.5,
    textAlign: 'center',
    marginBottom: 6
  },
  imgContainer: {
    width: `${IMG_SIZE}mm`,
    height: `${IMG_SIZE}mm`,
    alignSelf: 'center',
    marginBottom: 6,
    borderWidth: 0.3,
    borderColor: VERDE,
    borderRadius: 2,
    overflow: 'hidden'
  },
  imgPlaceholder: {
    width: `${IMG_SIZE}mm`,
    height: `${IMG_SIZE}mm`,
    alignSelf: 'center',
    marginBottom: 6,
    borderWidth: 0.3,
    borderColor: GRIS,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  imgPlaceholderText: {
    fontSize: 5,
    color: GRIS
  },
  campoRow: {
    marginBottom: 2,
    alignSelf: 'stretch'
  },
  campoValor: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center'
  }
})

function CarnetDelegado({ delegado }: { delegado: DelegadoDTO }) {
  const titulo = clubsDelegado(delegado) || 'Delegado'
  const imgSrc = delegado.fotoCarnet
    ? toImageDataUrl(delegado.fotoCarnet)
    : null

  const campos: Array<{
    label: string
    valor: string
    color: string
  }> = [
    { label: 'DNI:', valor: delegado.dni ?? '-', color: VERDE },
    { label: 'Nombre:', valor: delegado.nombre ?? '-', color: AZUL },
    { label: 'Apellido:', valor: delegado.apellido ?? '-', color: AZUL },
    {
      label: 'Fecha Nac:',
      valor: formatFechaNac(delegado),
      color: ROJO
    },
    {
      label: 'Categoría:',
      valor: categoriaFromFecha(delegado),
      color: ROJO
    }
  ]

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.subtitulo}>Liga</Text>
      {imgSrc ? (
        <View style={styles.imgContainer}>
          <Image
            src={imgSrc}
            style={{ width: `${IMG_SIZE}mm`, height: `${IMG_SIZE}mm` }}
            cache={false}
          />
        </View>
      ) : (
        <View style={styles.imgPlaceholder}>
          <Text style={styles.imgPlaceholderText}>Sin foto</Text>
        </View>
      )}
      {campos.map((c, idx) => (
        <View key={idx} style={styles.campoRow}>
          <Text style={[styles.campoValor, { color: c.color }]} wrap={false}>
            {c.valor}
          </Text>
        </View>
      ))}
    </View>
  )
}

function CarnetsDocument({ delegados }: { delegados: DelegadoDTO[] }) {
  const CARDS_PER_PAGE = 9
  const pages: DelegadoDTO[][] = []
  for (let i = 0; i < delegados.length; i += CARDS_PER_PAGE) {
    pages.push(delegados.slice(i, i + CARDS_PER_PAGE))
  }

  return (
    <Document>
      {pages.map((pageDelegados, pageIdx) => (
        <Page
          key={pageIdx}
          size='A4'
          orientation='portrait'
          style={styles.page}
        >
          {[0, 1, 2].map((row) => (
            <View key={row} style={styles.row}>
              {[0, 1, 2].map((col) => {
                const idx = row * CARDS_PER_ROW + col
                const delegado = pageDelegados[idx]
                if (!delegado)
                  return (
                    <View
                      key={col}
                      style={{
                        width: `${CARD_WIDTH}mm`,
                        height: `${CARD_HEIGHT}mm`
                      }}
                    />
                  )
                return (
                  <CarnetDelegado
                    key={delegado.id ?? idx}
                    delegado={delegado}
                  />
                )
              })}
            </View>
          ))}
        </Page>
      ))}
    </Document>
  )
}

export const generarCarnetsDelegadosPDF = async (
  delegados: DelegadoDTO[]
): Promise<void> => {
  if (delegados.length === 0) return

  const blob = await pdf(<CarnetsDocument delegados={delegados} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `carnets-delegados-${new Date().toISOString().slice(0, 10)}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
