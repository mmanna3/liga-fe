import { Calendar as CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { esValidoParaEliminacion } from '../lib/fixture'
import type { DatosWizardTorneo, EquipoWizard, Zona } from '../tipos'
import { VistaBracket } from './vista-bracket'
import { SelectorDeZona } from './selector-de-zona'

type ParticipanteBracket = {
  id: number
  nombre: string
  club: string
  torneo: string
  zona: string
}

interface FixtureEliminacionDirectaProps {
  zonasConEquipos: (Zona & {
    fechasLibres?: number
    fechasInterzonales?: number
  })[]
  usarModoZona: boolean
  claveGeneracion: number
  participantesBracket?: ParticipanteBracket[] | null
  participantesBracketPorZona?: Record<string, ParticipanteBracket[]>
}

/**
 * Fallback antes de generar: construye participantes con pairings válidos
 * (nunca LIBRE vs LIBRE, INTERZONAL vs INTERZONAL, ni LIBRE vs INTERZONAL).
 * Usa orden determinístico: los últimos numPlaceholders pares tienen (equipo, placeholder).
 */
function construirParticipantesFallback(
  equipos: EquipoWizard[],
  fechasLibres: number,
  fechasInterzonales: number
): ParticipanteBracket[] {
  const numPlaceholders = fechasLibres + fechasInterzonales
  const total = equipos.length + numPlaceholders
  const numPares = total / 2

  const placeholders: ParticipanteBracket[] = [
    ...Array.from({ length: fechasLibres }, (_, i) => ({
      id: -1 - i,
      nombre: 'LIBRE',
      club: '',
      torneo: '',
      zona: ''
    })),
    ...Array.from({ length: fechasInterzonales }, (_, i) => ({
      id: -100 - i,
      nombre: 'INTERZONAL',
      club: '',
      torneo: '',
      zona: ''
    }))
  ]

  const resultado: ParticipanteBracket[] = []
  let idxEquipo = 0
  let idxPlaceholder = 0

  for (let p = 0; p < numPares; p++) {
    const esPar = p >= numPares - numPlaceholders
    if (esPar) {
      resultado.push(equipos[idxEquipo++])
      resultado.push(placeholders[idxPlaceholder++])
    } else {
      resultado.push(equipos[idxEquipo++])
      resultado.push(equipos[idxEquipo++])
    }
  }

  return resultado
}

export function FixtureEliminacionDirecta({
  zonasConEquipos,
  usarModoZona,
  claveGeneracion,
  participantesBracket = null,
  participantesBracketPorZona = {}
}: FixtureEliminacionDirectaProps) {
  const { watch, setValue } = useFormContext<DatosWizardTorneo>()
  const equiposSeleccionados = watch('equiposSeleccionados')
  const fechasLibres = watch('fechasLibres')
  const fechasInterzonales = watch('fechasInterzonales')
  const zonas = watch('zonas')
  const cantidadEquipos = equiposSeleccionados.length

  const [zonaEliminacionSeleccionadaId, setZonaEliminacionSeleccionadaId] =
    useState<string>('')

  // Auto-seleccionar primera zona
  useEffect(() => {
    if (zonasConEquipos.length > 0) {
      const existe = zonasConEquipos.some(
        (z) => z.id === zonaEliminacionSeleccionadaId
      )
      if (!zonaEliminacionSeleccionadaId || !existe) {
        setZonaEliminacionSeleccionadaId(zonasConEquipos[0].id)
      }
    }
  }, [zonasConEquipos, zonaEliminacionSeleccionadaId])

  // Auto-sugerir fechasLibres para alcanzar la siguiente potencia de 2
  useEffect(() => {
    if (!usarModoZona && cantidadEquipos > 0) {
      const T = cantidadEquipos + fechasLibres + fechasInterzonales
      if (
        !esValidoParaEliminacion(
          cantidadEquipos,
          fechasLibres,
          fechasInterzonales
        )
      ) {
        const siguientePotencia = Math.pow(
          2,
          Math.ceil(Math.log2(Math.max(2, T)))
        )
        const necesarios = siguientePotencia - T
        if (necesarios > 0 && fechasLibres === 0 && fechasInterzonales === 0) {
          setValue('fechasLibres', necesarios)
        }
      }
    }
  }, [cantidadEquipos, usarModoZona])

  const zonaSeleccionada = zonasConEquipos.find(
    (z) => z.id === zonaEliminacionSeleccionadaId
  )

  const participantesParaMostrar = usarModoZona
    ? zonaSeleccionada
      ? (participantesBracketPorZona[zonaSeleccionada.id] ??
        construirParticipantesFallback(
          zonaSeleccionada.equipos,
          zonaSeleccionada.fechasLibres ?? 0,
          zonaSeleccionada.fechasInterzonales ?? 0
        ))
      : []
    : (participantesBracket ??
      construirParticipantesFallback(
        equiposSeleccionados,
        fechasLibres,
        fechasInterzonales
      ))

  const totalSlots = usarModoZona
    ? zonaSeleccionada
      ? zonaSeleccionada.equipos.length +
        (zonaSeleccionada.fechasLibres ?? 0) +
        (zonaSeleccionada.fechasInterzonales ?? 0)
      : 0
    : equiposSeleccionados.length + fechasLibres + fechasInterzonales

  return (
    <div key={claveGeneracion} className='bg-background rounded-xl border p-4'>
      {equiposSeleccionados.length > 0 ? (
        <div>
          <h4 className='font-semibold mb-4 flex items-center gap-2'>
            <CalendarIcon className='w-5 h-5 text-primary' />
            Llaves de eliminación directa
          </h4>
          {zonasConEquipos.length > 0 ? (
            <>
              <SelectorDeZona
                zonas={zonasConEquipos.map((z) => {
                  const total =
                    z.equipos.length +
                    (z.fechasLibres ?? 0) +
                    (z.fechasInterzonales ?? 0)
                  return {
                    id: z.id,
                    nombre: z.nombre,
                    detalle: `${z.equipos.length} equipos${
                      (z.fechasLibres ?? 0) + (z.fechasInterzonales ?? 0) > 0
                        ? ` + ${(z.fechasLibres ?? 0) + (z.fechasInterzonales ?? 0)} libre/interzonal = ${total} participantes`
                        : ''
                    }`
                  }
                })}
                zonaSeleccionadaId={zonaEliminacionSeleccionadaId}
                alCambiarZona={setZonaEliminacionSeleccionadaId}
                etiqueta='Ver llave de:'
              />
              {zonaEliminacionSeleccionadaId &&
                zonaSeleccionada &&
                participantesParaMostrar.length > 0 && (
                  <VistaBracket
                    totalSlots={totalSlots}
                    equipos={participantesParaMostrar.map((p) => ({
                      nombre: p.nombre
                    }))}
                    zonas={zonas}
                  />
                )}
            </>
          ) : (
            <VistaBracket
              totalSlots={totalSlots}
              equipos={participantesParaMostrar.map((p) => ({
                nombre: p.nombre
              }))}
              zonas={zonas}
            />
          )}
        </div>
      ) : (
        <EstadoVacio />
      )}
    </div>
  )
}

function EstadoVacio() {
  return (
    <div className='text-center py-8 text-muted-foreground'>
      <CalendarIcon className='w-12 h-12 mx-auto mb-3 opacity-50' />
      <p className='text-sm'>
        Hacé clic en &quot;Generar fixture&quot; para crear el calendario de
        jornadas
      </p>
    </div>
  )
}
