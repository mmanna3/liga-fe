import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  calcularTotalFechas,
  calcularTotalFechasPorZonas,
  construirParticipantesEliminacion,
  esConfiguracionValida,
  esValidoParaEliminacion,
  validarEmparejamientoInterzonal,
  validarZonas,
  type EntradaDeZona
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
  const esEliminacion = faseActual?.formato === 'eliminacion'
  const esTodosContraTodos = faseActual?.formato === 'todos-contra-todos'
  const vueltas = faseActual?.vueltas ?? 'ida'
  const cantidadEquipos = equiposSeleccionados.length

  const zonasConEquipos = zonas.filter((z) => z.equipos.length > 0)
  const usarModoZona =
    (esTodosContraTodos || esEliminacion) && zonasConEquipos.length > 0
  const tieneMultiplesZonas = zonasConEquipos.length > 1

  const entradasDeZona: EntradaDeZona[] = zonasConEquipos.map((z) => ({
    id: z.id,
    nombre: z.nombre,
    equipos: z.equipos.map((t) => ({ id: t.id, nombre: t.nombre })),
    fechasLibres: z.fechasLibres ?? 0,
    fechasInterzonales: z.fechasInterzonales ?? 0
  }))

  const validacionesZona = usarModoZona
    ? validarZonas(
        entradasDeZona,
        esEliminacion ? 'eliminacion' : 'todos-contra-todos'
      )
    : []
  const emparejamientoInterzonal = usarModoZona
    ? validarEmparejamientoInterzonal(entradasDeZona)
    : { esValido: true, mensaje: '' }

  const configValida = usarModoZona
    ? validacionesZona.every((v) => v.esValida) &&
      emparejamientoInterzonal.esValido
    : esEliminacion
      ? esValidoParaEliminacion(
          cantidadEquipos,
          fechasLibres,
          fechasInterzonales
        )
      : esConfiguracionValida(cantidadEquipos, fechasLibres, fechasInterzonales)

  const totalFechas = esTodosContraTodos
    ? usarModoZona
      ? calcularTotalFechasPorZonas(entradasDeZona, vueltas)
      : calcularTotalFechas(
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
          porZona[z.id] = construirParticipantesEliminacion(
            z.equipos,
            libres,
            interzonales
          )
        }
        setParticipantesBracketPorZona(porZona)
        setParticipantesBracket(null)
      } else {
        const participantes = construirParticipantesEliminacion(
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
