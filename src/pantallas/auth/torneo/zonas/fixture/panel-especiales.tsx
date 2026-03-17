import { useDraggable, useDroppable } from '@dnd-kit/core'

export function EspecialDraggable({
  valor
}: {
  valor: 'LIBRE' | 'INTERZONAL'
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `especial-${valor}`,
    data: { item: { type: 'especial' as const, valor } }
  })

  const estilos =
    valor === 'INTERZONAL'
      ? 'bg-blue-100 border border-blue-300 text-blue-800'
      : 'bg-amber-100 border border-amber-300 text-amber-800'

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md px-3 py-2 ${estilos} font-medium cursor-grab active:cursor-grabbing text-center touch-none ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      {valor === 'INTERZONAL' ? 'Interzonal' : 'Libre'}
    </div>
  )
}

export function ZonaDerechaDroppable({
  children
}: {
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'drop-derecha' })
  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 border-dashed p-4 min-h-[120px] transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}
    >
      {children}
    </div>
  )
}
