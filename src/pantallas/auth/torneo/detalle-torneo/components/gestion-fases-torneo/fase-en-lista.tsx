import { Card, CardContent } from '@/design-system/base-ui/card'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/logica-compartida/utils'
import { GripVertical } from 'lucide-react'
import type { FaseDTO, TorneoCategoriaDTO } from '@/api/clients'
import { FaseItem } from '../fase-item/fase-item'
import type { FaseEstado } from '../../lib'
import { idDragFaseTopLevel } from './lib/estructura-utils'

interface FaseEnListaProps {
  fase: FaseEstado
  faseIndex: number
  faseOriginal?: FaseDTO
  torneoId: number
  nombreTorneo: string
  categoriasTorneo: TorneoCategoriaDTO[]
  onActualizar: (campo: string, valor: string) => void
  onEliminar: () => void
  onIrAZonas: (faseId: number) => void
  estaGuardando: boolean
}

export function FaseEnLista({
  fase,
  faseIndex,
  faseOriginal,
  torneoId,
  nombreTorneo,
  categoriasTorneo,
  onActualizar,
  onEliminar,
  onIrAZonas,
  estaGuardando
}: FaseEnListaProps) {
  const dragId = idDragFaseTopLevel(fase)
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: dragId })

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 2 : undefined
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'opacity-60')}
    >
      <Card className='shadow-md'>
        <CardContent className='py-2'>
          <div className='flex items-start gap-1'>
            <button
              type='button'
              className={cn(
                'mt-1 flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md',
                'text-muted-foreground hover:bg-muted/80 active:cursor-grabbing'
              )}
              aria-label='Arrastrar fase al grupo'
              {...attributes}
              {...listeners}
            >
              <GripVertical className='h-4 w-4' />
            </button>
            <div className='min-w-0 flex-1'>
              <FaseItem
                torneoId={torneoId}
                nombreTorneo={nombreTorneo}
                fase={fase}
                faseIndex={faseIndex}
                faseOriginal={faseOriginal}
                categoriasTorneo={categoriasTorneo}
                onActualizar={onActualizar}
                onEliminar={onEliminar}
                onIrAZonas={() => {
                  if (fase.id != null) onIrAZonas(fase.id)
                }}
                estaGuardando={estaGuardando}
                enCard
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
