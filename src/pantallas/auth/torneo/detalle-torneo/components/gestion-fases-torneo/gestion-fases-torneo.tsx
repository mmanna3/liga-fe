import type { FaseDTO, TorneoDTO } from '@/api/clients'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { useMemo } from 'react'
import { BotoneraFases } from './botonera-fases'
import { FaseEnLista } from './fase-en-lista'
import { GrupoEnLista } from './grupo-en-lista'
import { idTopLevelDesdeElemento } from './lib/estructura-utils'
import type { useEstructuraFases } from './hooks/use-estructura-fases'

type EstructuraFasesApi = ReturnType<typeof useEstructuraFases>

interface GestionFasesTorneoProps {
  torneo: TorneoDTO
  torneoId: number
  editando: boolean
  estructura: EstructuraFasesApi
}

export function GestionFasesTorneo({
  torneo,
  torneoId,
  editando,
  estructura
}: GestionFasesTorneoProps) {
  const {
    torneoFases,
    elementos,
    actualizarFaseTopLevel,
    actualizarFaseEnGrupo,
    actualizarGrupo,
    eliminarFasePorId,
    eliminarGrupo,
    agregarFaseMutation,
    agregarGrupoDeFases,
    estaGuardandoZonas,
    irAZonas,
    handleDragEnd
  } = estructura

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    handleDragEnd(String(active.id), String(over.id))
  }

  const topLevelSortableIds = useMemo(
    () => elementos.map(idTopLevelDesdeElemento),
    [elementos]
  )

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={topLevelSortableIds}
          strategy={rectSortingStrategy}
        >
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {elementos.map((el, index) => {
              if (el.tipo === 'fase') {
                return (
                  <FaseEnLista
                    key={el.fase.id ?? `fase-top-${index}`}
                    fase={el.fase}
                    faseIndex={index}
                    faseOriginal={torneoFases.find(
                      (f: FaseDTO) => f.id === el.fase.id
                    )}
                    torneoId={torneoId}
                    nombreTorneo={torneo.nombre}
                    categoriasTorneo={torneo.categorias ?? []}
                    onActualizar={(campo, valor) =>
                      actualizarFaseTopLevel(index, campo, valor)
                    }
                    onEliminar={() => {
                      if (el.fase.id != null) eliminarFasePorId(el.fase.id)
                    }}
                    onIrAZonas={irAZonas}
                    estaGuardando={estaGuardandoZonas}
                  />
                )
              }

              return (
                <GrupoEnLista
                  key={el.grupo.idLocal}
                  grupo={el.grupo}
                  torneoId={torneoId}
                  nombreTorneo={torneo.nombre ?? ''}
                  torneoFases={torneoFases}
                  categoriasTorneo={torneo.categorias ?? []}
                  onActualizarGrupo={actualizarGrupo}
                  onActualizarFase={actualizarFaseEnGrupo}
                  onEliminarFase={eliminarFasePorId}
                  onEliminarGrupo={eliminarGrupo}
                  onAgregarSubgrupo={agregarGrupoDeFases}
                  onIrAZonas={irAZonas}
                  estaGuardando={estaGuardandoZonas}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {!editando && (
        <BotoneraFases
          onAgregarFase={() => agregarFaseMutation.mutate()}
          onAgregarGrupoDeFases={() => agregarGrupoDeFases()}
          estaCargandoFase={agregarFaseMutation.isPending}
        />
      )}
    </>
  )
}

export { useEstructuraFases } from './hooks/use-estructura-fases'
