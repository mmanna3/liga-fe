import { api } from '@/api/api'
import type {
  EquipoDeLaZonaDTO,
  JornadaDTO,
  TorneoFechaDTO
} from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Boton } from '@/design-system/ykn-ui/boton'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  buildJornadaBorrador,
  JornadaFilaEdicion,
  type CampoReemplazo,
  type JornadaBorrador,
  type PendienteReemplazo
} from './fechas/jornada-edicion'
import { Calendario } from '@/design-system/ykn-ui/calendario'
import { ModalAgregarJornada } from './modal-agregar-jornada'
import { ModalReemplazarEquipo } from './modal-reemplazar-equipo'
import type { ItemFixture } from './tipos'

export function NuevaFechaCard({
  nextNumero,
  equipos,
  zonaId,
  onCancelar
}: {
  nextNumero: number
  equipos: EquipoDeLaZonaDTO[]
  zonaId: number
  onCancelar: () => void
}) {
  const queryClient = useQueryClient()

  const [dia, setDia] = useState<Date | undefined>(undefined)
  const [jornadas, setJornadas] = useState<JornadaBorrador[]>([])
  const [pendienteReemplazo, setPendienteReemplazo] =
    useState<PendienteReemplazo | null>(null)
  const [modalAgregarJornada, setModalAgregarJornada] = useState(false)

  const equipoMap = new Map(equipos.map((e) => [Number(e.id), e]))

  const crearMutation = useApiMutation<void>({
    fn: () =>
      api.fechasPOST(zonaId, {
        numero: nextNumero,
        dia,
        esVisibleEnApp: false,
        jornadas: jornadas as unknown as JornadaDTO[]
      } as unknown as TorneoFechaDTO) as unknown as Promise<void>,
    mensajeDeExito: 'Fecha creada',
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['fechasAll', zonaId] })
      onCancelar()
    }
  })

  function handleEliminarJornada(idx: number) {
    setJornadas((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleReemplazarEquipo(equipo: EquipoDeLaZonaDTO) {
    if (!pendienteReemplazo) return
    const { jornadaIdx, campo } = pendienteReemplazo
    setJornadas((prev) => {
      const next = [...prev]
      next[jornadaIdx] = { ...next[jornadaIdx], [campo]: Number(equipo.id) }
      return next
    })
    setPendienteReemplazo(null)
  }

  function handleAgregarJornada(local: ItemFixture, visitante: ItemFixture) {
    setJornadas((prev) => [...prev, buildJornadaBorrador(local, visitante)])
  }

  return (
    <>
      <div className='rounded-lg border-2 border-dashed border-primary/30 bg-card p-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-3'>
          <h3 className='font-semibold text-muted-foreground'>
            Fecha {nextNumero}
          </h3>
        </div>

        {/* Día */}
        <div className='mb-3'>
          <Calendario selected={dia} onSelect={setDia} />
        </div>

        {/* Columnas header */}
        <div className='grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground mb-1'>
          <span className='text-right'>LOCAL</span>
          <span className='text-left'>VISITANTE</span>
          <span />
        </div>

        {/* Jornadas */}
        <div className='space-y-1 [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-muted-foreground/10'>
          {jornadas.map((j, i) => (
            <JornadaFilaEdicion
              key={i}
              j={j}
              equipoMap={equipoMap}
              onClickEquipo={(campo: CampoReemplazo, nombreActual: string) =>
                setPendienteReemplazo({ jornadaIdx: i, campo, nombreActual })
              }
              onEliminar={() => handleEliminarJornada(i)}
            />
          ))}
        </div>

        <button
          className='mt-2 text-sm text-primary hover:underline'
          onClick={() => setModalAgregarJornada(true)}
        >
          Agregar jornada +
        </button>

        <div className='flex gap-2 justify-end mt-4 pt-3 border-t'>
          <Boton variant='outline' onClick={onCancelar}>
            Cancelar
          </Boton>
          <Boton
            estaCargando={crearMutation.isPending}
            onClick={() => crearMutation.mutate()}
          >
            Guardar
          </Boton>
        </div>
      </div>

      <ModalReemplazarEquipo
        abierto={pendienteReemplazo != null}
        onCerrar={() => setPendienteReemplazo(null)}
        equipos={equipos}
        nombreReemplazado={pendienteReemplazo?.nombreActual ?? ''}
        onSeleccionar={handleReemplazarEquipo}
      />

      <ModalAgregarJornada
        abierto={modalAgregarJornada}
        onCerrar={() => setModalAgregarJornada(false)}
        equipos={equipos}
        onAgregar={handleAgregarJornada}
      />
    </>
  )
}
