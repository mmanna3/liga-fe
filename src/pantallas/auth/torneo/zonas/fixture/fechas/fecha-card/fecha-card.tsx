import { api } from '@/api/api'
import type {
  EquipoDeLaZonaDTO,
  JornadaDTO,
  TorneoFechaDTO
} from '@/api/clients'
import useApiMutation from '@/api/hooks/use-api-mutation'
import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  buildJornadaBorrador,
  type PendienteReemplazo
} from '../jornada-edicion'
import { ModalAgregarJornada } from '../../modal-agregar-jornada'
import { ModalReemplazarEquipo } from '../../modal-reemplazar-equipo'
import type { ItemFixture } from '../../tipos'
import { FechaModoLectura } from './fecha-modo-lectura'
import { FechaModoEdicion } from './fecha-modo-edicion'
import type { JornadaBorrador } from '../jornada-edicion'

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

  return (
    <>
      <div className='rounded-lg border bg-card p-4'>
        {!editando ? (
          <FechaModoLectura
            fecha={fecha}
            onEditar={handleEditar}
            onEliminar={() => eliminarMutation.mutate()}
            estaCargandoEliminar={eliminarMutation.isPending}
            mostrarBotonEliminar={esAdmin()}
          />
        ) : (
          borrador && (
            <FechaModoEdicion
              borrador={borrador}
              setBorrador={setBorrador}
              equipoMap={equipoMap}
              onEliminarJornada={handleEliminarJornada}
              onClickEquipo={(jornadaIdx, campo, nombreActual) =>
                setPendienteReemplazo({
                  jornadaIdx,
                  campo,
                  nombreActual
                })
              }
              onAbrirModalAgregar={() => setModalAgregarJornada(true)}
              onCancelar={handleCancelar}
              onGuardar={() => borrador && guardarMutation.mutate(borrador)}
              estaCargandoGuardar={guardarMutation.isPending}
            />
          )
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
