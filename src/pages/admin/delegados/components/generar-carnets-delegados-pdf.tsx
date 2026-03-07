import { DelegadoDTO } from '@/api/clients'
import {
  Document,
  Font,
  Image,
  Page,
  Path,
  pdf,
  StyleSheet,
  Svg,
  Text,
  View
} from '@react-pdf/renderer'

Font.register({
  family: 'CollegiateFLF',
  src: '/fonts/CollegiateFLF.ttf'
})

// Colores del diseño original Carnets.cshtml
const VERDE = '#01582e'
// const ROJO = '#e81f05'
const GRIS = '#b4b4b4'
// const NEGRO = '#111111'
const BLANCO = '#eeeeee'

const CARD_WIDTH = 68
const CARD_HEIGHT = 86
const CARDS_PER_ROW = 3
const MARGIN = 2
const GAP = 0
const IMG_SIZE = 38
const WATERMARK_SIZE = 42
const ICONO_LIGA = '/ligas/edefi/icono.png'

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

// const categoriaFromFecha = (d: DelegadoDTO): string => {
//   const f = d.fechaNacimiento
//   if (!f) return '-'
//   const date = typeof f === 'string' ? new Date(f) : f
//   const year = date.getFullYear()
//   return `Cat ${year}`
// }

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
    fontFamily: 'CollegiateFLF',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative' as const
  },
  cardTop: {
    alignItems: 'center',
    marginBottom: 0,
    flexShrink: 0
  },
  tituloContainer: {
    width: '100%',
    height: '32mm',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 2
  },
  waveSection: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: '42mm',
    height: '12mm',
    width: '100%'
  },
  rectanguloAbajoLaOla: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: '52mm',
    bottom: 0,
    backgroundColor: VERDE
  },
  watermarkIcono: {
    position: 'absolute' as const,
    right: '-8mm',
    top: '10mm',
    width: `${WATERMARK_SIZE}mm`,
    height: `${WATERMARK_SIZE}mm`,
    opacity: 0.18
  },
  waveSvg: {
    width: '100%',
    height: '100%'
  },
  camposSection: {
    paddingTop: 4,
    paddingHorizontal: 4,
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: VERDE,
    textAlign: 'center',
    fontFamily: 'CollegiateFLF',
    maxLines: 3
  },
  // subtitulo: {
  //   fontSize: 12,
  //   color: AZUL,
  //   textAlign: 'center',
  //   marginBottom: 6,
  //   fontFamily: 'CollegiateFLF'
  // },
  imgContainer: {
    width: `${IMG_SIZE}mm`,
    height: `${IMG_SIZE}mm`,
    minWidth: `${IMG_SIZE}mm`,
    minHeight: `${IMG_SIZE}mm`,
    flexShrink: 0,
    alignSelf: 'center',
    marginBottom: 6,
    borderWidth: 0.3,
    borderColor: VERDE,
    borderRadius: 10,
    overflow: 'hidden'
  },
  imgPlaceholder: {
    width: `${IMG_SIZE}mm`,
    height: `${IMG_SIZE}mm`,
    minWidth: `${IMG_SIZE}mm`,
    minHeight: `${IMG_SIZE}mm`,
    flexShrink: 0,
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
    color: GRIS,
    fontFamily: 'CollegiateFLF'
  },
  campoRow: {
    marginBottom: 2,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center'
  },
  campoValor: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'CollegiateFLF',
    width: '100%'
  }
})

function CarnetDelegado({ delegado }: { delegado: DelegadoDTO }) {
  const titulo = clubsDelegado(delegado) || 'Delegado'
  const imgSrc = delegado.fotoCarnet
    ? toImageDataUrl(delegado.fotoCarnet)
    : null

  const nombreCompleto =
    [delegado.nombre, delegado.apellido].filter(Boolean).join(' ') || '-'

  const campos: Array<{
    label: string
    valor: string
    color: string
    tamanio: number
  }> = [
    {
      label: 'Nombre:',
      valor: nombreCompleto,
      color: BLANCO,
      tamanio: nombreCompleto.length > 16 ? 12 : 16
    },
    { label: 'DNI:', valor: delegado.dni ?? '-', color: BLANCO, tamanio: 14 },
    {
      label: 'Fecha Nac:',
      valor: formatFechaNac(delegado),
      color: BLANCO,
      tamanio: 10
    }
    // {
    //   label: 'Categoría:',
    //   valor: categoriaFromFecha(delegado),
    //   color: BLANCO,
    //   tamanio: 14
    // }
  ]

  return (
    <View style={styles.card}>
      <View style={styles.rectanguloAbajoLaOla} />
      <Image src={ICONO_LIGA} style={styles.watermarkIcono} cache={false} />
      <View style={styles.waveSection}>
        <Svg
          viewBox='0 0 100 30'
          preserveAspectRatio='none'
          style={styles.waveSvg}
        >
          <Path
            d='M 0,30 L 0,10 Q 25,25 50,10 Q 75,0 100,10 L 100,30 Z'
            fill={VERDE}
          />
        </Svg>
      </View>
      <View style={styles.cardTop}>
        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>{titulo}</Text>
        </View>
        {/* <Text style={styles.subtitulo}>Liga</Text> */}
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
      </View>
      <View style={styles.camposSection}>
        {campos.map((c, idx) => (
          <View key={idx} style={styles.campoRow}>
            <Text
              style={[
                styles.campoValor,
                { color: c.color, fontSize: c.tamanio }
              ]}
              wrap={false}
            >
              {c.valor}
            </Text>
          </View>
        ))}
      </View>
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
