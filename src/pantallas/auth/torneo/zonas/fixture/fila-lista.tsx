import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ItemFixture } from './types'
import { labelItem } from './types'

export function FilaLista({
  item,
  index,
  isDragging
}: {
  item: ItemFixture
  index: number
  isDragging?: boolean
}) {
  const id = `left-${index}`
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingState
  } = useDraggable({ id, data: { item, index } })
  const dragging = isDragging ?? isDraggingState

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm transition-colors touch-none ${
        dragging
          ? 'opacity-50 shadow-lg'
          : 'cursor-grab active:cursor-grabbing hover:bg-muted/50'
      }`}
      {...listeners}
      {...attributes}
    >
      <span className='text-muted-foreground font-medium w-8 shrink-0'>
        {index + 1}
      </span>
      <span
        className={
          item.type === 'especial'
            ? item.valor === 'INTERZONAL'
              ? 'px-2 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-800 font-medium'
              : 'px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800 font-medium'
            : ''
        }
      >
        {labelItem(item)}
      </span>
    </li>
  )
}

export function SlotDroppable({
  index,
  children
}: {
  index: number
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `drop-${index}` })
  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'ring-2 ring-primary rounded-md' : ''}
    >
      {children}
    </div>
  )
}
