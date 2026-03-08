import { cn } from '@/logica-compartida/utils'
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  GripVertical
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  calculateFixtureStats,
  generarTodosLosFixtures,
  generarFixture,
  esConfiguracionValida,
  fusionarYResolverInterzonal,
  type FixtureDate,
  type FixtureStats,
  type ZoneInput
} from '../lib/fixture'
import type { DatosWizardTorneo, Zona } from '../tipos'
import { SelectorDeZona } from './selector-de-zona'

interface FixtureTodosContraTodosProps {
  zonasConEquipos: (Zona & {
    fechasLibres?: number
    fechasInterzonales?: number
  })[]
  entradasDeZona: ZoneInput[]
  usarModoZona: boolean
  claveGeneracion: number
  fixtureGenerado: boolean
}

export function FixtureTodosContraTodos({
  zonasConEquipos,
  entradasDeZona,
  usarModoZona,
  claveGeneracion,
  fixtureGenerado
}: FixtureTodosContraTodosProps) {
  const { watch, setValue } = useFormContext<DatosWizardTorneo>()
  const equiposSeleccionados = watch('equiposSeleccionados')
  const fechasLibres = watch('fechasLibres')
  const fechasInterzonales = watch('fechasInterzonales')
  const fases = watch('fases')
  const indiceFaseActual = watch('indiceFaseActual')

  const faseActual = fases[indiceFaseActual]
  const vueltas = faseActual?.vueltas ?? 'single'
  const cantidadEquipos = equiposSeleccionados.length

  const [fechasFixture, setFechasFixture] = useState<FixtureDate[]>([])
  const [fixturesPorZona, setFixturesPorZona] = useState<
    Array<{ zoneId: string; zoneName: string; dates: FixtureDate[] }>
  >([])
  const [fechasFusionadas, setFechasFusionadas] = useState<FixtureDate[]>([])
  const [estadisticas, setEstadisticas] = useState<FixtureStats | null>(null)
  const [idEntradaArrastrada, setIdEntradaArrastrada] = useState<string | null>(
    null
  )
  const [zonaSeleccionadaId, setZonaSeleccionadaId] = useState<string>('')

  // Auto-seleccionar primera zona cuando se generan los fixtures
  useEffect(() => {
    if (usarModoZona && fixturesPorZona.length > 0 && !zonaSeleccionadaId) {
      setZonaSeleccionadaId(fixturesPorZona[0].zoneId)
    }
  }, [usarModoZona, fixturesPorZona, zonaSeleccionadaId])

  // Auto-sugerir fechasLibres para paridad
  useEffect(() => {
    if (!usarModoZona && cantidadEquipos > 0) {
      if (
        cantidadEquipos % 2 !== 0 &&
        fechasLibres === 0 &&
        fechasInterzonales === 0
      ) {
        setValue('fechasLibres', 1)
      }
    }
  }, [cantidadEquipos, usarModoZona])

  const alGenerar = () => {
    // Limpiar estado previo
    setFechasFixture([])
    setFixturesPorZona([])
    setFechasFusionadas([])

    if (usarModoZona) {
      const fixtures = generarTodosLosFixtures(entradasDeZona, vueltas)
      setFixturesPorZona(
        fixtures.map((f) => ({
          zoneId: f.zoneId,
          zoneName: f.zoneName,
          dates: f.dates
        }))
      )
      const fusionadas = fusionarYResolverInterzonal(fixtures)
      setFechasFusionadas(fusionadas)
      setFechasFixture([])

      const estadisticasPrimeraZona = fixtures[0]?.stats ?? null
      setEstadisticas(estadisticasPrimeraZona)
    } else {
      const equipos = equiposSeleccionados.map((t) => ({
        id: t.id,
        name: t.nombre
      }))
      const fechas = generarFixture(
        equipos,
        fechasLibres,
        fechasInterzonales,
        vueltas
      )
      setFechasFixture(fechas)
      setFixturesPorZona([])
      setFechasFusionadas([])

      const nuevasEstadisticas = calculateFixtureStats(
        fechas,
        equipos,
        fechasLibres,
        fechasInterzonales,
        vueltas
      )
      setEstadisticas(nuevasEstadisticas)
    }
    setValue('fixtureGenerado', true, { shouldValidate: true })
  }

  // Exponer generación al padre (llamado via cambios en claveGeneracion)
  useEffect(() => {
    if (claveGeneracion > 0) {
      const configValida = usarModoZona
        ? true // el padre ya valida
        : esConfiguracionValida(
            cantidadEquipos,
            fechasLibres,
            fechasInterzonales
          )
      if (configValida) {
        alGenerar()
      }
    }
  }, [claveGeneracion])

  // Drag and drop
  const alIniciarArrastre = (entradaId: string) => {
    setIdEntradaArrastrada(entradaId)
  }

  const alArrastrarSobre = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const alSoltar = (
    entradaObjetivoId: string,
    numeroFecha: number,
    enModoZona?: boolean,
    zonaId?: string
  ) => {
    if (!idEntradaArrastrada || idEntradaArrastrada === entradaObjetivoId) {
      setIdEntradaArrastrada(null)
      return
    }

    const intercambiarEntradas = (prev: FixtureDate[]) => {
      const fecha = prev.find((d) => d.dateNumber === numeroFecha)
      if (!fecha) return prev
      const idxArrastrada = fecha.entries.findIndex(
        (e) => e.id === idEntradaArrastrada
      )
      const idxObjetivo = fecha.entries.findIndex(
        (e) => e.id === entradaObjetivoId
      )
      if (idxArrastrada < 0 || idxObjetivo < 0) return prev
      return prev.map((d) => {
        if (d.dateNumber !== numeroFecha) return d
        const nuevasEntradas = [...d.entries]
        const temp = nuevasEntradas[idxArrastrada]
        nuevasEntradas[idxArrastrada] = nuevasEntradas[idxObjetivo]
        nuevasEntradas[idxObjetivo] = temp
        return { ...d, entries: nuevasEntradas }
      })
    }

    if (enModoZona && zonaId) {
      setFixturesPorZona((prev) =>
        prev.map((zf) =>
          zf.zoneId === zonaId
            ? { ...zf, dates: intercambiarEntradas(zf.dates) }
            : zf
        )
      )
    } else {
      setFechasFixture(intercambiarEntradas)
    }

    setIdEntradaArrastrada(null)
  }

  // Calcular fechas a mostrar
  const idsEquiposEnZonaSeleccionada = usarModoZona
    ? new Set(
        zonasConEquipos
          .find((z) => z.id === zonaSeleccionadaId)
          ?.equipos.map((t) => t.id) ?? []
      )
    : new Set<number>()

  const fechasMostradas = usarModoZona
    ? (() => {
        const zf = fixturesPorZona.find((f) => f.zoneId === zonaSeleccionadaId)
        if (!zf) return []
        return zf.dates.map((fd) => {
          const regulares = fd.entries.filter((e) => e.type === 'regular')
          const libres = fd.entries.filter((e) => e.type === 'libre')
          const fechaFusionada = fechasFusionadas.find(
            (m) => m.dateNumber === fd.dateNumber
          )
          const interzonalesResueltos =
            fechaFusionada?.entries.filter(
              (e) =>
                e.type === 'interzonal' &&
                (e.homeTeamId != null
                  ? idsEquiposEnZonaSeleccionada.has(e.homeTeamId)
                  : idsEquiposEnZonaSeleccionada.has(e.awayTeamId!))
            ) ?? []
          const interzonalesCrudos = fd.entries.filter(
            (e) => e.type === 'interzonal'
          )
          const interzonales =
            interzonalesResueltos.length > 0
              ? interzonalesResueltos
              : interzonalesCrudos
          return {
            ...fd,
            entries: [...regulares, ...libres, ...interzonales]
          }
        })
      })()
    : fechasFixture

  const tieneFixture = fechasFixture.length > 0 || fixturesPorZona.length > 0

  return (
    <>
      {/* Estadísticas */}
      {estadisticas && fixtureGenerado && (
        <PanelEstadisticas estadisticas={estadisticas} />
      )}

      {/* Vista del fixture */}
      <div
        key={claveGeneracion}
        className='bg-background rounded-xl border p-4'
      >
        {tieneFixture ? (
          <div>
            {usarModoZona && fixturesPorZona.length > 0 && (
              <SelectorDeZona
                zonas={fixturesPorZona.map((zf) => ({
                  id: zf.zoneId,
                  nombre: zf.zoneName,
                  detalle: `${zf.dates.length} fechas`
                }))}
                zonaSeleccionadaId={zonaSeleccionadaId}
                alCambiarZona={setZonaSeleccionadaId}
                etiqueta='Ver fechas de:'
              />
            )}

            <h4 className='font-semibold mb-4'>
              Fixture generado — {fechasMostradas.length} fechas
              {usarModoZona && zonaSeleccionadaId && (
                <span className='font-normal text-muted-foreground'>
                  {' '}
                  (
                  {
                    fixturesPorZona.find((z) => z.zoneId === zonaSeleccionadaId)
                      ?.zoneName
                  }
                  )
                </span>
              )}
            </h4>

            {fechasMostradas.map((fd) => (
              <div key={fd.dateNumber} className='mb-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold'>
                    {fd.dateNumber}
                  </span>
                  <h5 className='font-semibold text-sm'>
                    Fecha {fd.dateNumber}
                  </h5>
                </div>

                <div className='mb-2'>
                  <div className='grid grid-cols-3 items-center gap-3 text-xs font-medium text-muted-foreground px-3'>
                    <div className='text-right'>Local</div>
                    <div className='text-center' />
                    <div className='text-left'>Visitante</div>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  {fd.entries.map((entrada) => (
                    <div
                      key={entrada.id}
                      className={cn(
                        'rounded-lg p-2.5 cursor-move hover:bg-accent transition-colors',
                        entrada.type === 'regular' && 'bg-muted',
                        entrada.type === 'libre' &&
                          'bg-amber-50 border border-amber-200',
                        entrada.type === 'interzonal' &&
                          'bg-blue-50 border border-blue-200'
                      )}
                      draggable
                      onDragStart={() => alIniciarArrastre(entrada.id)}
                      onDragOver={alArrastrarSobre}
                      onDrop={() =>
                        alSoltar(
                          entrada.id,
                          fd.dateNumber,
                          usarModoZona,
                          zonaSeleccionadaId
                        )
                      }
                    >
                      <div className='flex items-center gap-2'>
                        <GripVertical className='w-4 h-4 text-muted-foreground shrink-0' />
                        <div className='grid grid-cols-3 items-center gap-3 text-sm flex-1'>
                          <div className='text-right'>
                            <span
                              className={cn(
                                'font-medium',
                                entrada.home === 'INTERZONAL' &&
                                  'text-blue-700 italic'
                              )}
                            >
                              {entrada.home}
                            </span>
                          </div>
                          <div className='text-center'>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium border',
                                entrada.type === 'regular' &&
                                  'bg-background text-muted-foreground',
                                entrada.type === 'libre' &&
                                  'bg-amber-100 text-amber-700 border-amber-300',
                                entrada.type === 'interzonal' &&
                                  'bg-blue-100 text-blue-700 border-blue-300'
                              )}
                            >
                              vs
                            </span>
                          </div>
                          <div className='text-left'>
                            <span
                              className={cn(
                                'font-medium',
                                entrada.away === 'LIBRE' &&
                                  'text-amber-700 italic',
                                entrada.away === 'INTERZONAL' &&
                                  'text-blue-700 italic'
                              )}
                            >
                              {entrada.away}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8 text-muted-foreground'>
            <CalendarIcon className='w-12 h-12 mx-auto mb-3 opacity-50' />
            <p className='text-sm'>
              Hacé clic en &quot;Generar fixture&quot; para crear el calendario
              de jornadas
            </p>
          </div>
        )}
      </div>
    </>
  )
}

function PanelEstadisticas({ estadisticas }: { estadisticas: FixtureStats }) {
  return (
    <div className='p-3 bg-muted rounded-lg space-y-2'>
      <p className='text-sm font-medium'>
        Fixture generado — {estadisticas.totalDates} fechas
      </p>
      <p className='text-sm text-muted-foreground'>
        Cada equipo juega{' '}
        <strong className='text-foreground'>
          {estadisticas.expectedHomeGames}{' '}
          {estadisticas.expectedHomeGames === 1 ? 'partido' : 'partidos'} de
          local
        </strong>{' '}
        y{' '}
        <strong className='text-foreground'>
          {estadisticas.expectedAwayGames} de visitante
        </strong>
        .
      </p>
      {estadisticas.exceptions.length > 0 && (
        <div className='space-y-1'>
          <p className='text-xs font-medium text-amber-700 flex items-center gap-1'>
            <AlertTriangle className='w-3 h-3' />
            Excepciones en la distribución:
          </p>
          {estadisticas.exceptions.map((ex, i) => (
            <p key={i} className='text-xs text-amber-700 pl-4'>
              • {ex}
            </p>
          ))}
        </div>
      )}
      {estadisticas.exceptions.length === 0 && (
        <p className='text-xs text-muted-foreground'>
          Distribución equilibrada. Sin excepciones.
        </p>
      )}
    </div>
  )
}
