import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FaseDTO, TorneoCategoriaDTO } from '@/api/clients'
import { cn } from '@/logica-compartida/utils'
import { GrupoDeFasesItem } from './grupo-de-fases-item'
import type { GrupoDeFasesEstado } from './lib/tipos'
import { idDragGrupoTopLevel } from './lib/estructura-utils'

interface GrupoEnListaProps {
  grupo: GrupoDeFasesEstado
  torneoId: number
  nombreTorneo: string
  torneoFases: FaseDTO[]
  categoriasTorneo: TorneoCategoriaDTO[]
  onActualizarNombre: (nombre: string) => void
  onActualizarFase: (faseIndex: number, campo: string, valor: string) => void
  onEliminarFase: (faseIndex: number) => void
  onEliminarGrupo: () => void
  onIrAZonas: (faseId: number) => void
  estaGuardando: boolean
}

export function GrupoEnLista({
  grupo,
  torneoId,
  nombreTorneo,
  torneoFases,
  categoriasTorneo,
  onActualizarNombre,
  onActualizarFase,
  onEliminarFase,
  onEliminarGrupo,
  onIrAZonas,
  estaGuardando
}: GrupoEnListaProps) {
  const dragId = idDragGrupoTopLevel(grupo)
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: dragId
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 2 : undefined
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('col-span-full', isDragging && 'opacity-60')}
    >
      <GrupoDeFasesItem
        grupo={grupo}
        torneoId={torneoId}
        nombreTorneo={nombreTorneo}
        torneoFases={torneoFases}
        categoriasTorneo={categoriasTorneo}
        onActualizarNombre={onActualizarNombre}
        onActualizarFase={onActualizarFase}
        onEliminarFase={onEliminarFase}
        onEliminarGrupo={onEliminarGrupo}
        onIrAZonas={onIrAZonas}
        estaGuardando={estaGuardando}
      />
    </div>
  )
}
