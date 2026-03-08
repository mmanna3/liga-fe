import { cn } from '@/logica-compartida/utils'
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  GripVertical
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  calcularEstadisticasFixture,
  esConfiguracionValida,
  fusionarYResolverInterzonal,
  generarFixture,
  generarTodosLosFixtures,
  type EntradaDeZona,
  type EstadisticasFixture,
  type FechaFixture
} from '../lib/fixture'
import type { DatosWizardTorneo, Zona } from '../tipos'
import { SelectorDeZona } from './selector-de-zona'

interface FixtureTodosContraTodosProps {
  zonasConEquipos: (Zona & {
    fechasLibres?: number
    fechasInterzonales?: number
  })[]
  entradasDeZona: EntradaDeZona[]
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
  const vueltas = faseActual?.vueltas ?? 'ida'
  const cantidadEquipos = equiposSeleccionados.length

  const [fechasFixture, setFechasFixture] = useState<FechaFixture[]>([])
  const [fixturesPorZona, setFixturesPorZona] = useState<
    Array<{ idZona: string; nombreZona: string; fechas: FechaFixture[] }>
  >([])
  const [fechasFusionadas, setFechasFusionadas] = useState<FechaFixture[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasFixture | null>(
    null
  )
  const [idEntradaArrastrada, setIdEntradaArrastrada] = useState<string | null>(
    null
  )
  const [zonaSeleccionadaId, setZonaSeleccionadaId] = useState<string>('')

  // Auto-seleccionar primera zona cuando se generan los fixtures
  useEffect(() => {
    if (usarModoZona && fixturesPorZona.length > 0 && !zonaSeleccionadaId) {
      setZonaSeleccionadaId(fixturesPorZona[0].idZona)
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
    setFechasFixture([])
    setFixturesPorZona([])
    setFechasFusionadas([])

    if (usarModoZona) {
      const fixtures = generarTodosLosFixtures(entradasDeZona, vueltas)
      setFixturesPorZona(
        fixtures.map((f) => ({
          idZona: f.idZona,
          nombreZona: f.nombreZona,
          fechas: f.fechas
        }))
      )
      const fusionadas = fusionarYResolverInterzonal(fixtures)
      setFechasFusionadas(fusionadas)
      setFechasFixture([])

      const estadisticasPrimeraZona = fixtures[0]?.estadisticas ?? null
      setEstadisticas(estadisticasPrimeraZona)
    } else {
      const equipos = equiposSeleccionados.map((t) => ({
        id: t.id,
        nombre: t.nombre
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

      const nuevasEstadisticas = calcularEstadisticasFixture(
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

    const intercambiarEntradas = (prev: FechaFixture[]) => {
      const fecha = prev.find((d) => d.numeroFecha === numeroFecha)
      if (!fecha) return prev
      const idxArrastrada = fecha.entradas.findIndex(
        (e) => e.id === idEntradaArrastrada
      )
      const idxObjetivo = fecha.entradas.findIndex(
        (e) => e.id === entradaObjetivoId
      )
      if (idxArrastrada < 0 || idxObjetivo < 0) return prev
      return prev.map((d) => {
        if (d.numeroFecha !== numeroFecha) return d
        const nuevasEntradas = [...d.entradas]
        const temp = nuevasEntradas[idxArrastrada]
        nuevasEntradas[idxArrastrada] = nuevasEntradas[idxObjetivo]
        nuevasEntradas[idxObjetivo] = temp
        return { ...d, entradas: nuevasEntradas }
      })
    }

    if (enModoZona && zonaId) {
      setFixturesPorZona((prev) =>
        prev.map((zf) =>
          zf.idZona === zonaId
            ? { ...zf, fechas: intercambiarEntradas(zf.fechas) }
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
        const zf = fixturesPorZona.find((f) => f.idZona === zonaSeleccionadaId)
        if (!zf) return []
        return zf.fechas.map((fd) => {
          const regulares = fd.entradas.filter((e) => e.tipo === 'regular')
          const libres = fd.entradas.filter((e) => e.tipo === 'libre')
          const fechaFusionada = fechasFusionadas.find(
            (m) => m.numeroFecha === fd.numeroFecha
          )
          const interzonalesResueltos =
            fechaFusionada?.entradas.filter(
              (e) =>
                e.tipo === 'interzonal' &&
                (e.idEquipoLocal != null
                  ? idsEquiposEnZonaSeleccionada.has(e.idEquipoLocal)
                  : idsEquiposEnZonaSeleccionada.has(e.idEquipoVisitante!))
            ) ?? []
          const interzonalesCrudos = fd.entradas.filter(
            (e) => e.tipo === 'interzonal'
          )
          const interzonales =
            interzonalesResueltos.length > 0
              ? interzonalesResueltos
              : interzonalesCrudos
          return {
            ...fd,
            entradas: [...regulares, ...libres, ...interzonales]
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
                  id: zf.idZona,
                  nombre: zf.nombreZona,
                  detalle: `${zf.fechas.length} fechas`
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
                    fixturesPorZona.find((z) => z.idZona === zonaSeleccionadaId)
                      ?.nombreZona
                  }
                  )
                </span>
              )}
            </h4>

            {fechasMostradas.map((fd) => (
              <div key={fd.numeroFecha} className='mb-6'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold'>
                    {fd.numeroFecha}
                  </span>
                  <h5 className='font-semibold text-sm'>
                    Fecha {fd.numeroFecha}
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
                  {fd.entradas.map((entrada) => (
                    <div
                      key={entrada.id}
                      className={cn(
                        'rounded-lg p-2.5 cursor-move hover:bg-accent transition-colors',
                        entrada.tipo === 'regular' && 'bg-muted',
                        entrada.tipo === 'libre' &&
                          'bg-amber-50 border border-amber-200',
                        entrada.tipo === 'interzonal' &&
                          'bg-blue-50 border border-blue-200'
                      )}
                      draggable
                      onDragStart={() => alIniciarArrastre(entrada.id)}
                      onDragOver={alArrastrarSobre}
                      onDrop={() =>
                        alSoltar(
                          entrada.id,
                          fd.numeroFecha,
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
                                entrada.local === 'INTERZONAL' &&
                                  'text-blue-700 italic'
                              )}
                            >
                              {entrada.local}
                            </span>
                          </div>
                          <div className='text-center'>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium border',
                                entrada.tipo === 'regular' &&
                                  'bg-background text-muted-foreground',
                                entrada.tipo === 'libre' &&
                                  'bg-amber-100 text-amber-700 border-amber-300',
                                entrada.tipo === 'interzonal' &&
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
                                entrada.visitante === 'LIBRE' &&
                                  'text-amber-700 italic',
                                entrada.visitante === 'INTERZONAL' &&
                                  'text-blue-700 italic'
                              )}
                            >
                              {entrada.visitante}
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

function PanelEstadisticas({
  estadisticas
}: {
  estadisticas: EstadisticasFixture
}) {
  return (
    <div className='p-3 bg-muted rounded-lg space-y-2'>
      <p className='text-sm font-medium'>
        Fixture generado — {estadisticas.totalFechas} fechas
      </p>
      <p className='text-sm text-muted-foreground'>
        Cada equipo juega{' '}
        <strong className='text-foreground'>
          {estadisticas.partidosLocalEsperados}{' '}
          {estadisticas.partidosLocalEsperados === 1 ? 'partido' : 'partidos'}{' '}
          de local
        </strong>{' '}
        y{' '}
        <strong className='text-foreground'>
          {estadisticas.partidosVisitanteEsperados} de visitante
        </strong>
        .
      </p>
      {estadisticas.excepciones.length > 0 && (
        <div className='space-y-1'>
          <p className='text-xs font-medium text-amber-700 flex items-center gap-1'>
            <AlertTriangle className='w-3 h-3' />
            Excepciones en la distribución:
          </p>
          {estadisticas.excepciones.map((ex, i) => (
            <p key={i} className='text-xs text-amber-700 pl-4'>
              • {ex}
            </p>
          ))}
        </div>
      )}
      {estadisticas.excepciones.length === 0 && (
        <p className='text-xs text-muted-foreground'>
          Distribución equilibrada. Sin excepciones.
        </p>
      )}
    </div>
  )
}
