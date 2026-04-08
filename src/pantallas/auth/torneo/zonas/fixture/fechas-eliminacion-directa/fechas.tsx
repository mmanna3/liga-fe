import {
  FechaEliminacionDirectaDTO,
  LocalVisitanteEnum,
  type JornadaDTO
} from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { useToggleVisibilidadFechaEnApp } from '@/api/hooks/use-visibilidad-en-app'
import { HttpClientWrapper } from '@/api/http-client-wrapper'
import { Button } from '@/design-system/base-ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { VisibleSoloParaAdmin } from '@/design-system/visible-solo-para-admin'
import Icono from '@/design-system/ykn-ui/icono'
import { toDateOnly } from '@/logica-compartida/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import {
  BotonCargarResultados,
  ESTADO_BOTON_CARGAR_RESULTADOS,
  jornadaTieneResultadosCargados,
  type EstadoBotonCargarResultados
} from '../components/boton-cargar-resultados'
import { NOMBRES_INSTANCIA_BRACKET } from '../generacion/eliminacion-directa/fixture-vista-previa'
import { EncabezadoFechaColumna } from './encabezado-fecha-columna'
import { ModalCargarResultados } from './modal-cargar-resultados'
import { Partidos } from './partidos'

const http = new HttpClientWrapper()

async function fetchFechasEliminacionDirecta(
  zonaId: number
): Promise<FechaEliminacionDirectaDTO[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const url = `${baseUrl}/api/Zona/${zonaId}/fechas`
  const res = await http.fetch(url, { headers: { Accept: 'text/plain' } })
  if (!res.ok) {
    throw new Error(`No se pudieron cargar las fechas (${res.status})`)
  }
  const text = await res.text()
  const data = text === '' ? null : JSON.parse(text)
  if (!Array.isArray(data)) return []
  return data.map((item) => FechaEliminacionDirectaDTO.fromJS(item))
}

/** Cantidad de equipos de la primera ronda (n = 2^k). */
function inferirNEquiposBracket(
  fechas: FechaEliminacionDirectaDTO[]
): number | null {
  const ids = fechas.map((f) => f.instanciaId ?? 0)
  const porMax = Math.max(0, ...ids)
  const primera = [...fechas].sort(
    (a, b) => (b.instanciaId ?? 0) - (a.instanciaId ?? 0)
  )[0]
  const porJornadas = (primera?.jornadas?.length ?? 0) * 2

  const esNValido = (n: number) => n >= 2 && Number.isInteger(Math.log2(n))

  if (porMax > 0 && esNValido(porMax)) return porMax
  if (porJornadas > 0 && esNValido(porJornadas)) return porJornadas
  return null
}

function tituloColumna(
  equiposEnRonda: number,
  fecha: FechaEliminacionDirectaDTO | undefined,
  rIdx: number
): string {
  if (fecha?.instanciaNombre?.trim()) return fecha.instanciaNombre.trim()
  if (NOMBRES_INSTANCIA_BRACKET[equiposEnRonda]) {
    return NOMBRES_INSTANCIA_BRACKET[equiposEnRonda]
  }
  return `Ronda ${rIdx + 1}`
}

/** Estado visual del botón según el primer partido de la primera jornada de la instancia. */
function estadoBotonCargarDesdePrimeraJornada(
  primeraJornada: JornadaDTO | undefined
): (typeof ESTADO_BOTON_CARGAR_RESULTADOS)[number] {
  if (!primeraJornada) return ESTADO_BOTON_CARGAR_RESULTADOS[0]
  if (!jornadaTieneResultadosCargados(primeraJornada)) {
    return ESTADO_BOTON_CARGAR_RESULTADOS[0]
  }
  if (!primeraJornada.resultadosVerificados) {
    return ESTADO_BOTON_CARGAR_RESULTADOS[1]
  }
  return ESTADO_BOTON_CARGAR_RESULTADOS[2]
}

function partidoDesdeJornada(j: JornadaDTO): {
  local: string | null
  visitante: string | null
} {
  if (j.tipo === 'Normal') {
    return { local: j.local ?? null, visitante: j.visitante ?? null }
  }
  if (j.tipo === 'SinEquipos') {
    return { local: null, visitante: null }
  }
  if (j.tipo === 'Libre') {
    return { local: j.equipoLocal ?? null, visitante: 'Libre' }
  }
  const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
  return esLocal
    ? { local: j.equipo ?? null, visitante: 'Interzonal' }
    : { local: 'Interzonal', visitante: j.equipo ?? null }
}

function EncabezadoTituloYAccionesEliminacion({
  titulo,
  hayJornadaCargable,
  estadoBotonCargar,
  onCargarResultados,
  zonaId,
  fecha
}: {
  titulo: string
  hayJornadaCargable: boolean
  estadoBotonCargar: EstadoBotonCargarResultados
  onCargarResultados: () => void
  zonaId: number
  fecha: FechaEliminacionDirectaDTO | undefined
}) {
  const toggleVisibilidadFechaMutation = useToggleVisibilidadFechaEnApp(
    zonaId,
    fecha?.id,
    fecha?.esVisibleEnApp
  )
  const esVisibleFechaEnApp = fecha?.esVisibleEnApp ?? true

  return (
    <div className='flex w-full min-w-0 items-center justify-center gap-2'>
      <h4 className='text-sm font-semibold min-w-0 truncate'>{titulo}</h4>
      <div className='flex shrink-0 items-center'>
        {hayJornadaCargable && (
          <BotonCargarResultados
            estado={estadoBotonCargar}
            onClick={onCargarResultados}
          />
        )}
        {fecha?.id != null && (
          <VisibleSoloParaAdmin>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7'
                  disabled={toggleVisibilidadFechaMutation.isPending}
                  aria-label={
                    esVisibleFechaEnApp
                      ? 'Fecha visible en la app'
                      : 'Fecha no visible en la app'
                  }
                  onClick={() => toggleVisibilidadFechaMutation.mutate()}
                >
                  {toggleVisibilidadFechaMutation.isPending ? (
                    <Icono
                      nombre='Cargando'
                      className='size-3.5 animate-spin text-muted-foreground'
                    />
                  ) : (
                    <Icono
                      nombre={esVisibleFechaEnApp ? 'Visible' : 'NoVisible'}
                      className='size-3.5 text-muted-foreground'
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side='bottom'
                className='max-w-xs px-3 py-2'
                sideOffset={8}
              >
                <p>
                  {esVisibleFechaEnApp
                    ? 'La fecha es visible en la app'
                    : 'La fecha no es visible en la app'}
                </p>
              </TooltipContent>
            </Tooltip>
          </VisibleSoloParaAdmin>
        )}
      </div>
    </div>
  )
}

export function FechasEliminacionDirecta({ zonaId }: { zonaId: number }) {
  const [modalResultados, setModalResultados] = useState<{
    tituloInstancia: string
    subtitulo?: string
    jornadas: JornadaDTO[]
  } | null>(null)

  const { data: fechas = [], isPending } = useApiQuery({
    key: ['fechasEliminacionDirecta', zonaId],
    fn: () => fetchFechasEliminacionDirecta(zonaId),
    activado: Number.isFinite(zonaId)
  })

  const nEquipos = inferirNEquiposBracket(fechas)
  const fechasPorInstanciaId = new Map<number, FechaEliminacionDirectaDTO>()
  for (const f of fechas) {
    if (f.instanciaId != null) {
      fechasPorInstanciaId.set(f.instanciaId, f)
    }
  }

  if (isPending) {
    return (
      <p className='text-muted-foreground py-4'>Cargando fechas del fixture…</p>
    )
  }

  if (fechas.length === 0) {
    return (
      <p className='text-muted-foreground py-4'>
        No hay fechas cargadas para esta zona.
      </p>
    )
  }

  if (nEquipos == null) {
    return (
      <p className='text-muted-foreground py-4'>
        No se pudo armar la llave: revisá que la primera instancia tenga un
        tamaño válido (potencia de 2).
      </p>
    )
  }

  const totalRondas = Math.log2(nEquipos)

  const columnas = Array.from({ length: totalRondas }, (_, rIdx) => {
    const equiposEnRonda = nEquipos / Math.pow(2, rIdx)
    const instanciaId = equiposEnRonda
    const cantidadPartidos = equiposEnRonda / 2
    const fecha = fechasPorInstanciaId.get(instanciaId)
    const titulo = tituloColumna(equiposEnRonda, fecha, rIdx)
    const diaMostrado = fecha?.dia ?? undefined

    const partidos: {
      local: string | null
      visitante: string | null
      resultadoLocal: string | null
      resultadoVisitante: string | null
      penalesLocal: string | null
      penalesVisitante: string | null
    }[] = []
    for (let i = 0; i < cantidadPartidos; i++) {
      const j = fecha?.jornadas?.[i]
      const p0 = j?.partidos?.[0]
      if (j != null) {
        const rl = p0?.resultadoLocal
        const rv = p0?.resultadoVisitante
        const pl = p0?.penalesLocal
        const pv = p0?.penalesVisitante
        partidos.push({
          ...partidoDesdeJornada(j),
          resultadoLocal:
            rl != null && String(rl).trim() !== '' ? String(rl) : null,
          resultadoVisitante:
            rv != null && String(rv).trim() !== '' ? String(rv) : null,
          penalesLocal:
            pl != null && String(pl).trim() !== '' ? String(pl) : null,
          penalesVisitante:
            pv != null && String(pv).trim() !== '' ? String(pv) : null
        })
      } else {
        partidos.push({
          local: null,
          visitante: null,
          resultadoLocal: null,
          resultadoVisitante: null,
          penalesLocal: null,
          penalesVisitante: null
        })
      }
    }

    return {
      rIdx,
      instanciaId,
      key: fecha?.id ?? `ronda-${instanciaId}`,
      titulo,
      diaMostrado,
      partidos,
      fecha
    }
  })

  return (
    <div>
      <div className='flex gap-6 mb-2'>
        {columnas.map((col) => {
          const subtituloFecha =
            col.diaMostrado != null
              ? format(toDateOnly(col.diaMostrado), "EEEE d 'de' MMMM", {
                  locale: es
                })
              : undefined

          const jornadasCol = col.fecha?.jornadas ?? []
          const hayJornadaCargable = jornadasCol.some(
            (j) => j.tipo !== 'SinEquipos'
          )
          const primeraJornadaParaEstado = jornadasCol.find(
            (j) => j.tipo !== 'SinEquipos'
          )
          const estadoBotonCargar = estadoBotonCargarDesdePrimeraJornada(
            primeraJornadaParaEstado
          )

          return (
            <div key={col.key} className='flex-1 min-w-[200px] text-center'>
              <EncabezadoTituloYAccionesEliminacion
                titulo={col.titulo}
                hayJornadaCargable={hayJornadaCargable}
                estadoBotonCargar={estadoBotonCargar}
                zonaId={zonaId}
                fecha={col.fecha}
                onCargarResultados={() =>
                  setModalResultados({
                    tituloInstancia: col.titulo,
                    subtitulo: subtituloFecha,
                    jornadas: jornadasCol
                  })
                }
              />
              <EncabezadoFechaColumna
                fecha={col.fecha}
                diaMostrado={col.diaMostrado}
                zonaId={zonaId}
              />
            </div>
          )
        })}
      </div>

      <Partidos columnas={columnas} />

      <ModalCargarResultados
        open={modalResultados != null}
        onOpenChange={(open) => {
          if (!open) setModalResultados(null)
        }}
        tituloInstancia={modalResultados?.tituloInstancia ?? ''}
        subtitulo={modalResultados?.subtitulo}
        jornadas={modalResultados?.jornadas ?? []}
        zonaId={zonaId}
      />
    </div>
  )
}
