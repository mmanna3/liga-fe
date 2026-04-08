import { api } from '@/api/api'
import { ClubDTO, DelegadoDTO } from '@/api/clients'
import {
  colorAgrupadorValidoODefecto,
  type ColorAgrupadorTorneo
} from '@/pantallas/auth/torneo/agrupador-torneo/colores-agrupador-torneo'
import roboto400 from '@fontsource/roboto/files/roboto-latin-400-normal.woff?url'
import roboto600 from '@fontsource/roboto/files/roboto-latin-600-normal.woff?url'
import roboto700 from '@fontsource/roboto/files/roboto-latin-700-normal.woff?url'
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
  family: 'VarsityTeam',
  src: '/fonts/VarsityTeam-Bold.otf'
})

Font.register({
  family: 'Roboto',
  fonts: [
    { src: roboto400, fontWeight: 400 },
    { src: roboto600, fontWeight: 600 },
    { src: roboto700, fontWeight: 700 }
  ]
})

// Evita que las palabras se corten con guiones; si no entran, bajan de renglón completas
Font.registerHyphenationCallback((word) => [word])

// Tonos de acento alineados al VERDE histórico (#01582e): oscuros, similar “peso” visual
const HEX_ACCENTO_POR_COLOR: Record<ColorAgrupadorTorneo, string> = {
  Negro: '#111111',
  Azul: '#0a3a62',
  Rojo: '#6e1219',
  Verde: '#01582e'
}

const GRIS = '#b4b4b4'
const BLANCO = '#eeeeee'

const CARD_WIDTH = 68
const CARD_HEIGHT = 92
const CARDS_PER_ROW = 3
const MARGIN = 2
const GAP = 0
const IMG_SIZE = 38
const WATERMARK_SIZE = 42
const ICONO_LIGA = '/ligas/edefi/icono.png'

/** Expande delegados a un carnet por club. Si tiene varios clubs → varios carnets idénticos salvo el club. */
const expandirDelegadosACarnets = (
  delegados: DelegadoDTO[]
): Array<{ delegado: DelegadoDTO; clubNombre: string }> => {
  const items: Array<{ delegado: DelegadoDTO; clubNombre: string }> = []
  for (const d of delegados) {
    const clubs =
      d.delegadoClubs
        ?.map((dc) => dc.clubNombre)
        .filter((c): c is string => Boolean(c)) ?? []
    if (clubs.length === 0) {
      items.push({ delegado: d, clubNombre: 'Delegado' })
    } else {
      for (const clubNombre of clubs) {
        items.push({ delegado: d, clubNombre })
      }
    }
  }
  return items
}

/** Primer torneo = primer equipo en la lista del club; color según agrupador de la primera zona de ese equipo. */
function hexAccentCarnetDelegado(
  delegado: DelegadoDTO,
  clubNombre: string,
  clubPorId: Map<number, ClubDTO>,
  colorAgrupadorPorId: Map<number, ColorAgrupadorTorneo>
): string {
  if (clubNombre === 'Delegado') return HEX_ACCENTO_POR_COLOR.Negro

  const dc = delegado.delegadoClubs?.find((c) => c.clubNombre === clubNombre)
  if (dc?.clubId == null) return HEX_ACCENTO_POR_COLOR.Negro

  const nombresEquipos = dc.equiposDelClub
  if (!nombresEquipos?.length) return HEX_ACCENTO_POR_COLOR.Negro

  const primerNombre = nombresEquipos[0].trim()
  const club = clubPorId.get(dc.clubId)
  const equipo = club?.equipos?.find((e) => e.nombre?.trim() === primerNombre)
  const agrupadorId = equipo?.zonas?.[0]?.agrupadorId
  if (agrupadorId == null) return HEX_ACCENTO_POR_COLOR.Negro

  const colorCat = colorAgrupadorPorId.get(agrupadorId)
  if (!colorCat) return HEX_ACCENTO_POR_COLOR.Negro
  return HEX_ACCENTO_POR_COLOR[colorCat]
}

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
    borderRadius: 4,
    padding: '5mm',
    fontFamily: 'VarsityTeam',
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
    paddingBottom: 2
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
    bottom: 0
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
    textAlign: 'center',
    fontFamily: 'VarsityTeam',
    maxLines: 3
  },
  // subtitulo: {
  //   fontSize: 12,
  //   color: AZUL,
  //   textAlign: 'center',
  //   marginBottom: 6,
  //   fontFamily: 'VarsityTeam'
  // },
  imgContainer: {
    width: `${IMG_SIZE}mm`,
    height: `${IMG_SIZE}mm`,
    minWidth: `${IMG_SIZE}mm`,
    minHeight: `${IMG_SIZE}mm`,
    flexShrink: 0,
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 6,
    borderWidth: 0.3,
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
    fontFamily: 'VarsityTeam'
  },
  campoRow: {
    marginBottom: 2,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center'
  },
  campoValor: {
    fontSize: 14,
    // fontWeight: 'bold',
    paddingBottom: 3,
    textAlign: 'center',
    fontFamily: 'Roboto',
    width: '100%'
  }
})

function CarnetDelegado({
  delegado,
  clubNombre,
  accentColor
}: {
  delegado: DelegadoDTO
  clubNombre: string
  accentColor: string
}) {
  const titulo = clubNombre
  const imgSrc = delegado.fotoCarnet
    ? toImageDataUrl(delegado.fotoCarnet)
    : null

  const nombreCompleto =
    [delegado.nombre?.trim(), delegado.apellido?.trim()]
      .filter(Boolean)
      .join(' ')
      .trim() || '-'

  const campos: Array<{
    label: string
    valor: string
    color: string
    tamanio: number
    fontWeight: string
  }> = [
    {
      label: 'Nombre:',
      valor: nombreCompleto,
      color: BLANCO,
      tamanio:
        nombreCompleto.length > 22 ? 10 : nombreCompleto.length > 16 ? 14 : 16,
      fontWeight: 'semibold'
    },
    {
      label: 'DNI:',
      valor: delegado.dni ?? '-',
      color: BLANCO,
      tamanio: 13,
      fontWeight: 'normal'
    },
    {
      label: 'Fecha Nac:',
      valor: formatFechaNac(delegado),
      color: BLANCO,
      tamanio: 10,
      fontWeight: 'normal'
    }
    // {
    //   label: 'Categoría:',
    //   valor: categoriaFromFecha(delegado),
    //   color: BLANCO,
    //   tamanio: 14
    // }
  ]

  return (
    <View style={[styles.card, { borderColor: accentColor }]}>
      <View
        style={[styles.rectanguloAbajoLaOla, { backgroundColor: accentColor }]}
      />
      <Image src={ICONO_LIGA} style={styles.watermarkIcono} cache={false} />
      <View style={styles.waveSection}>
        <Svg
          viewBox='0 0 100 30'
          preserveAspectRatio='none'
          style={styles.waveSvg}
        >
          <Path
            d='M 0,30 L 0,10 Q 25,25 50,10 Q 75,0 100,10 L 100,30 Z'
            fill={accentColor}
          />
        </Svg>
      </View>
      <View style={styles.cardTop}>
        <View style={styles.tituloContainer}>
          <Text style={[styles.titulo, { color: accentColor }]}>{titulo}</Text>
        </View>
        {/* <Text style={styles.subtitulo}>Liga</Text> */}
        {imgSrc ? (
          <View style={[styles.imgContainer, { borderColor: accentColor }]}>
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
                {
                  color: c.color,
                  fontSize: c.tamanio,
                  fontWeight: c.fontWeight
                }
              ]}
            >
              {c.valor}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

type CarnetItem = {
  delegado: DelegadoDTO
  clubNombre: string
  accentColor: string
}

function CarnetsDocument({ items }: { items: CarnetItem[] }) {
  const CARDS_PER_PAGE = 9
  const pages: CarnetItem[][] = []
  for (let i = 0; i < items.length; i += CARDS_PER_PAGE) {
    pages.push(items.slice(i, i + CARDS_PER_PAGE))
  }

  return (
    <Document>
      {pages.map((pageItems, pageIdx) => (
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
                const item = pageItems[idx]
                if (!item)
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
                    key={`${item.delegado.id}-${item.clubNombre}-${idx}`}
                    delegado={item.delegado}
                    clubNombre={item.clubNombre}
                    accentColor={item.accentColor}
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

  const base = expandirDelegadosACarnets(delegados)
  const idsClub = [
    ...new Set(
      base
        .map(({ delegado, clubNombre }) => {
          const dc = delegado.delegadoClubs?.find(
            (c) => c.clubNombre === clubNombre
          )
          return dc?.clubId
        })
        .filter((id): id is number => id != null)
    )
  ]

  const [agrupadores, clubs] = await Promise.all([
    api.torneoAgrupadorAll(),
    idsClub.length > 0
      ? api.clubsPorIds(idsClub)
      : Promise.resolve<ClubDTO[]>([])
  ])

  const colorAgrupadorPorId = new Map<number, ColorAgrupadorTorneo>()
  for (const a of agrupadores) {
    if (a.id != null)
      colorAgrupadorPorId.set(a.id, colorAgrupadorValidoODefecto(a.color))
  }
  const clubPorId = new Map<number, ClubDTO>(
    clubs.filter((c) => c.id != null).map((c) => [c.id!, c])
  )

  const items: CarnetItem[] = base.map(({ delegado, clubNombre }) => ({
    delegado,
    clubNombre,
    accentColor: hexAccentCarnetDelegado(
      delegado,
      clubNombre,
      clubPorId,
      colorAgrupadorPorId
    )
  }))

  const blob = await pdf(<CarnetsDocument items={items} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `carnets-delegados-${new Date().toISOString().slice(0, 10)}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
