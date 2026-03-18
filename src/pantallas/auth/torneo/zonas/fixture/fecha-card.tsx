import { api } from '@/api/api'
import type {
  EquipoDeLaZonaDTO,
  JornadaDTO,
  TorneoFechaDTO
} from '@/api/clients'
import { LocalVisitanteEnum } from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { Button } from '@/design-system/base-ui/button'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import ModalEliminacion from '@/design-system/modal-eliminacion'
import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  buildJornadaBorrador,
  claseEspecial,
  JornadaFilaEdicion,
  type CampoReemplazo,
  type JornadaBorrador,
  type PendienteReemplazo
} from './_jornada-edicion'
import { DiaMesPicker } from './dia-mes-picker'
import { ModalAgregarJornada } from './modal-agregar-jornada'
import { ModalReemplazarEquipo } from './modal-reemplazar-equipo'
import type { ItemFixture } from './types'

// ---------------------------------------------------------------------------
// Helpers de visualización
// ---------------------------------------------------------------------------

function formatDia(dia: Date | undefined): string {
  if (!dia) return ''
  return `${dia.getUTCDate()}/${dia.getUTCMonth() + 1}`
}

// ---------------------------------------------------------------------------
// Fila de jornada en modo vista
// ---------------------------------------------------------------------------

function JornadaFilaVista({ j }: { j: JornadaDTO }) {
  let localLabel: string
  let visitanteLabel: string

  if (j.tipo === 'Normal') {
    localLabel = j.local ?? '—'
    visitanteLabel = j.visitante ?? '—'
  } else if (j.tipo === 'Libre') {
    localLabel = j.equipo ?? '—'
    visitanteLabel = 'Libre'
  } else {
    const esLocal = j.localOVisitante !== LocalVisitanteEnum._2
    localLabel = esLocal ? (j.equipo ?? '—') : 'Interzonal'
    visitanteLabel = esLocal ? 'Interzonal' : (j.equipo ?? '—')
  }

  return (
    <div className='grid grid-cols-[1fr_1fr] gap-4 text-sm py-1'>
      <span className={`text-right ${claseEspecial(localLabel)}`}>
        {localLabel}
      </span>
      <span className={`text-left ${claseEspecial(visitanteLabel)}`}>
        {visitanteLabel}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function FechaCard({
  fecha,
  equipos,
  zonaId
}: {
  fecha: TorneoFechaDTO
  equipos: EquipoDeLaZonaDTO[]
  zonaId: number
}) {
  const { esAdmin } = useAuth()
  const queryClient = useQueryClient()

  const [editando, setEditando] = useState(false)
  const [borrador, setBorrador] = useState<{
    dia: Date | undefined
    jornadas: JornadaBorrador[]
  } | null>(null)
  const [pendienteReemplazo, setPendienteReemplazo] =
    useState<PendienteReemplazo | null>(null)
  const [modalAgregarJornada, setModalAgregarJornada] = useState(false)

  const equipoMap = new Map(equipos.map((e) => [Number(e.id), e]))

  // --- Mutations ---

  const eliminarMutation = useApiMutation<void>({
    fn: () => api.fechasDELETE(zonaId, fecha.id!) as unknown as Promise<void>,
    mensajeDeExito: 'Fecha eliminada',
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['fechasAll', zonaId] })
    }
  })

  const guardarMutation = useApiMutation<{
    dia: Date | undefined
    jornadas: JornadaBorrador[]
  }>({
    fn: (draft) =>
      api.fechasPUT(zonaId, fecha.id!, {
        ...fecha,
        dia: draft.dia,
        jornadas: draft.jornadas as unknown as JornadaDTO[]
      } as unknown as TorneoFechaDTO),
    mensajeDeExito: 'Fecha actualizada',
    antesDeMensajeExito: () => {
      queryClient.invalidateQueries({ queryKey: ['fechasAll', zonaId] })
      setEditando(false)
      setBorrador(null)
    }
  })

  // --- Handlers ---

  function handleEditar() {
    setBorrador({
      dia: fecha.dia,
      jornadas: (fecha.jornadas ?? []).map((j) => ({
        tipo: j.tipo ?? 'Normal',
        resultadosVerificados: j.resultadosVerificados,
        localId: j.localId,
        visitanteId: j.visitanteId,
        equipoId: j.equipoId,
        localOVisitante: j.localOVisitante
      }))
    })
    setEditando(true)
  }

  function handleCancelar() {
    setEditando(false)
    setBorrador(null)
  }

  function handleEliminarJornada(idx: number) {
    setBorrador((prev) =>
      prev
        ? { ...prev, jornadas: prev.jornadas.filter((_, i) => i !== idx) }
        : prev
    )
  }

  function handleReemplazarEquipo(equipo: EquipoDeLaZonaDTO) {
    if (!pendienteReemplazo) return
    const { jornadaIdx, campo } = pendienteReemplazo
    setBorrador((prev) => {
      if (!prev) return prev
      const jornadas = [...prev.jornadas]
      jornadas[jornadaIdx] = {
        ...jornadas[jornadaIdx],
        [campo]: Number(equipo.id)
      }
      return { ...prev, jornadas }
    })
    setPendienteReemplazo(null)
  }

  function handleAgregarJornada(local: ItemFixture, visitante: ItemFixture) {
    setBorrador((prev) =>
      prev
        ? {
            ...prev,
            jornadas: [...prev.jornadas, buildJornadaBorrador(local, visitante)]
          }
        : prev
    )
  }

  // --- Render ---

  const diaDisplay = formatDia(fecha.dia)

  return (
    <>
      <div className='rounded-lg border bg-card p-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <h3 className='font-semibold'>Fecha {fecha.numero}</h3>
            {diaDisplay && (
              <span className='text-sm text-muted-foreground'>
                — {diaDisplay}
              </span>
            )}
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={handleEditar}
            >
              <Icono nombre='Editar' className='size-3.5' />
            </Button>
            {esAdmin() && (
              <ModalEliminacion
                titulo='Eliminar fecha'
                subtitulo={`¿Confirmás que querés eliminar la Fecha ${fecha.numero}? Se eliminarán también todas sus jornadas.`}
                eliminarTexto='Eliminar fecha'
                estaCargando={eliminarMutation.isPending}
                eliminarOnClick={() => eliminarMutation.mutate()}
                trigger={
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 text-muted-foreground hover:text-destructive'
                  >
                    <Icono nombre='Eliminar' className='size-3.5' />
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Modo vista */}
        {!editando && (
          <>
            <div className='grid grid-cols-[1fr_1fr] gap-4 text-xs font-medium text-muted-foreground mb-1'>
              <span className='text-right'>LOCAL</span>
              <span className='text-left'>VISITANTE</span>
            </div>
            <div className='space-y-1 [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-muted-foreground/10'>
              {(fecha.jornadas ?? []).map((j, i) => (
                <JornadaFilaVista key={i} j={j} />
              ))}
            </div>
          </>
        )}

        {/* Modo edición */}
        {editando && borrador && (
          <>
            {/* Día editable — arriba del header de columnas */}
            <div className='mb-3'>
              <DiaMesPicker
                dia={borrador.dia}
                onChange={(dia) => setBorrador((p) => (p ? { ...p, dia } : p))}
              />
            </div>

            <div className='grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground mb-1'>
              <span className='text-right'>LOCAL</span>
              <span className='text-left'>VISITANTE</span>
              <span />
            </div>

            <div className='space-y-1 [&>div:not(:last-child)]:border-b [&>div:not(:last-child)]:border-muted-foreground/10'>
              {borrador.jornadas.map((j, i) => (
                <JornadaFilaEdicion
                  key={i}
                  j={j}
                  equipoMap={equipoMap}
                  onClickEquipo={(
                    campo: CampoReemplazo,
                    nombreActual: string
                  ) =>
                    setPendienteReemplazo({
                      jornadaIdx: i,
                      campo,
                      nombreActual
                    })
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
              <Boton variant='outline' onClick={handleCancelar}>
                Cancelar
              </Boton>
              <Boton
                estaCargando={guardarMutation.isPending}
                onClick={() => borrador && guardarMutation.mutate(borrador)}
              >
                Guardar
              </Boton>
            </div>
          </>
        )}
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
