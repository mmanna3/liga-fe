import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  calculateTotalDates,
  calculateTotalDatesForZones,
  esConfiguracionValida,
  esValidoParaEliminacion,
  validarEmparejamientoInterzonal,
  validarZonas,
  type ZoneInput
} from '../lib/fixture'
import type { DatosWizardTorneo, Zona } from '../tipos'
import { FixtureEliminacionDirecta } from './fixture-eliminacion-directa'
import { FixtureTodosContraTodos } from './fixture-todos-contra-todos'
import { MiniResumen } from './mini-resumen'
import { PanelValidacion } from './panel-validacion'
import { TablaConfigZonas } from './tabla-config-zonas'

export function Paso5Fixture() {
  const {
    watch,
    setValue,
    formState: { errors }
  } = useFormContext<DatosWizardTorneo>()

  const [claveGeneracion, setClaveGeneracion] = useState(0)
  const [participantesBracket, setParticipantesBracket] = useState<Array<{
    id: number
    nombre: string
    club: string
    torneo: string
    zona: string
  }> | null>(null)
  const [participantesBracketPorZona, setParticipantesBracketPorZona] =
    useState<
      Record<
        string,
        Array<{
          id: number
          nombre: string
          club: string
          torneo: string
          zona: string
        }>
      >
    >({})

  const fases = watch('fases')
  const indiceFaseActual = watch('indiceFaseActual')
  const equiposSeleccionados = watch('equiposSeleccionados')
  const fechasLibres = watch('fechasLibres')
  const fechasInterzonales = watch('fechasInterzonales')
  const fixtureGenerado = watch('fixtureGenerado')
  const zonas = watch('zonas') as (Zona & { fechasLibres?: number })[]

  const faseActual = fases[indiceFaseActual]
  const esEliminacion = faseActual?.formato === 'elimination'
  const esTodosContraTodos = faseActual?.formato === 'all-vs-all'
  const vueltas = faseActual?.vueltas ?? 'single'
  const cantidadEquipos = equiposSeleccionados.length

  const zonasConEquipos = zonas.filter((z) => z.equipos.length > 0)
  const usarModoZona =
    (esTodosContraTodos || esEliminacion) && zonasConEquipos.length > 0
  const tieneMultiplesZonas = zonasConEquipos.length > 1

  const entradasDeZona: ZoneInput[] = zonasConEquipos.map((z) => ({
    id: z.id,
    name: z.nombre,
    teams: z.equipos.map((t) => ({ id: t.id, name: t.nombre })),
    freeDates: z.fechasLibres ?? 0,
    interzonalDates: z.fechasInterzonales ?? 0
  }))

  const validacionesZona = usarModoZona
    ? validarZonas(entradasDeZona, esEliminacion ? 'elimination' : 'all-vs-all')
    : []
  const emparejamientoInterzonal = usarModoZona
    ? validarEmparejamientoInterzonal(entradasDeZona)
    : { isValid: true, message: '' }

  const configValida = usarModoZona
    ? validacionesZona.every((v) => v.isValid) &&
      emparejamientoInterzonal.isValid
    : esEliminacion
      ? esValidoParaEliminacion(
          cantidadEquipos,
          fechasLibres,
          fechasInterzonales
        )
      : esConfiguracionValida(cantidadEquipos, fechasLibres, fechasInterzonales)

  const totalFechas = esTodosContraTodos
    ? usarModoZona
      ? calculateTotalDatesForZones(entradasDeZona, vueltas)
      : calculateTotalDates(
          cantidadEquipos,
          fechasLibres,
          fechasInterzonales,
          vueltas
        )
    : 0

  useEffect(() => {
    if (!fixtureGenerado) {
      setParticipantesBracket(null)
      setParticipantesBracketPorZona({})
    }
  }, [fixtureGenerado])

  const mezclar = <T,>(arr: T[]): T[] =>
    [...arr].sort(() => Math.random() - 0.5)

  const PLACEHOLDER_LIBRE = (i: number) => ({
    id: -1 - i,
    nombre: 'LIBRE',
    club: '',
    torneo: '',
    zona: ''
  })
  const PLACEHOLDER_INTERZONAL = (i: number) => ({
    id: -100 - i,
    nombre: 'INTERZONAL',
    club: '',
    torneo: '',
    zona: ''
  })

  /**
   * Construye participantes para la llave de eliminación directa.
   * Regla: LIBRE e INTERZONAL nunca pueden enfrentarse entre sí ni con otro placeholder.
   * Cada placeholder solo se empareja con un equipo real (bye).
   */
  const construirParticipantes = (
    equipos: {
      id: number
      nombre: string
      club: string
      torneo: string
      zona: string
    }[],
    libres: number,
    interzonales: number
  ) => {
    const numPlaceholders = libres + interzonales
    const total = equipos.length + numPlaceholders
    const numPares = total / 2

    const equiposMezclados = mezclar([...equipos])
    const placeholders = mezclar([
      ...Array.from({ length: libres }, (_, i) => PLACEHOLDER_LIBRE(i)),
      ...Array.from({ length: interzonales }, (_, i) =>
        PLACEHOLDER_INTERZONAL(i)
      )
    ])

    const indicesPareConPlaceholder = mezclar(
      Array.from({ length: numPares }, (_, i) => i)
    ).slice(0, numPlaceholders)

    const paresConPlaceholder = new Set(indicesPareConPlaceholder)
    type Participante = {
      id: number
      nombre: string
      club: string
      torneo: string
      zona: string
    }
    const resultado: Participante[] = []
    let idxEquipo = 0
    let idxPlaceholder = 0

    for (let p = 0; p < numPares; p++) {
      if (paresConPlaceholder.has(p)) {
        resultado.push(equiposMezclados[idxEquipo++])
        resultado.push(placeholders[idxPlaceholder++])
      } else {
        resultado.push(equiposMezclados[idxEquipo++])
        resultado.push(equiposMezclados[idxEquipo++])
      }
    }

    return resultado
  }

  const alGenerar = () => {
    setClaveGeneracion((k) => k + 1)

    if (esEliminacion) {
      if (usarModoZona) {
        const porZona: Record<
          string,
          Array<{
            id: number
            nombre: string
            club: string
            torneo: string
            zona: string
          }>
        > = {}
        for (const z of zonasConEquipos) {
          const libres = z.fechasLibres ?? 0
          const interzonales = z.fechasInterzonales ?? 0
          porZona[z.id] = construirParticipantes(
            z.equipos,
            libres,
            interzonales
          )
        }
        setParticipantesBracketPorZona(porZona)
        setParticipantesBracket(null)
      } else {
        const participantes = construirParticipantes(
          equiposSeleccionados,
          fechasLibres,
          fechasInterzonales
        )
        setParticipantesBracket(participantes)
        setParticipantesBracketPorZona({})
      }
      setValue('fixtureGenerado', true, { shouldValidate: true })
    }
    // Para todos-contra-todos, el componente FixtureTodosContraTodos maneja la generación via claveGeneracion
  }

  return (
    <div className='space-y-4'>
      <MiniResumen />

      {(esTodosContraTodos || esEliminacion) && (
        <div className='space-y-4'>
          {/* Inputs de configuración de zonas */}
          {usarModoZona ? (
            <TablaConfigZonas
              zonasConEquipos={zonasConEquipos}
              tieneMultiplesZonas={tieneMultiplesZonas}
            />
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='fechasLibres' className='block mb-1.5'>
                  Fechas libre por equipo
                </Label>
                <Input
                  id='fechasLibres'
                  type='number'
                  min={0}
                  value={fechasLibres}
                  onChange={(e) => {
                    const v = Math.max(0, parseInt(e.target.value) || 0)
                    setValue('fechasLibres', v)
                    setValue('fixtureGenerado', false)
                  }}
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  Cada equipo descansa esta cantidad de jornadas
                </p>
              </div>

              <div>
                <Label htmlFor='fechasInterzonales' className='block mb-1.5'>
                  Fechas interzonal por equipo
                </Label>
                <Input
                  id='fechasInterzonales'
                  type='number'
                  min={0}
                  value={fechasInterzonales}
                  onChange={(e) => {
                    const v = Math.max(0, parseInt(e.target.value) || 0)
                    setValue('fechasInterzonales', v)
                    setValue('fixtureGenerado', false)
                  }}
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  Cada equipo juega interzonal esta cantidad de jornadas
                </p>
              </div>
            </div>
          )}

          {/* Panel de validación + botón generar */}
          <PanelValidacion
            configValida={configValida}
            esEliminacion={esEliminacion}
            esTodosContraTodos={esTodosContraTodos}
            usarModoZona={usarModoZona}
            tieneMultiplesZonas={tieneMultiplesZonas}
            validacionesZona={validacionesZona}
            emparejamientoInterzonal={emparejamientoInterzonal}
            entradasDeZona={entradasDeZona}
            totalFechas={totalFechas}
            vueltas={vueltas}
            cantidadEquipos={cantidadEquipos}
            fechasLibres={fechasLibres}
            fechasInterzonales={fechasInterzonales}
            fixtureGenerado={fixtureGenerado}
            errorFixture={errors.fixtureGenerado?.message}
            alGenerar={alGenerar}
          />
        </div>
      )}

      {/* Vista de fixture según formato */}
      {esEliminacion ? (
        <FixtureEliminacionDirecta
          zonasConEquipos={zonasConEquipos}
          usarModoZona={usarModoZona}
          claveGeneracion={claveGeneracion}
          participantesBracket={participantesBracket}
          participantesBracketPorZona={participantesBracketPorZona}
        />
      ) : esTodosContraTodos ? (
        <FixtureTodosContraTodos
          zonasConEquipos={zonasConEquipos}
          entradasDeZona={entradasDeZona}
          usarModoZona={usarModoZona}
          claveGeneracion={claveGeneracion}
          fixtureGenerado={fixtureGenerado}
        />
      ) : null}
    </div>
  )
}
