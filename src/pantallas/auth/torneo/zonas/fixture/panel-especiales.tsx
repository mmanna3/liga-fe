import { useDraggable, useDroppable } from '@dnd-kit/core'
import { clasesInterzonalFondo, labelItem } from './tipos'

export function EspecialDraggable({
  valor,
  interzonalNumero
}: {
  valor: 'LIBRE' | 'INTERZONAL'
  /** Solo aplica a Interzonal; por defecto 1. */
  interzonalNumero?: number
}) {
  const numero = valor === 'INTERZONAL' ? (interzonalNumero ?? 1) : undefined
  const id =
    valor === 'LIBRE'
      ? 'especial-LIBRE'
      : (`especial-INTERZONAL-${numero}` as const)

  const item =
    valor === 'LIBRE'
      ? { type: 'especial' as const, valor: 'LIBRE' as const }
      : {
          type: 'especial' as const,
          valor: 'INTERZONAL' as const,
          numero: numero!
        }

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { item }
  })

  const estilos =
    valor === 'LIBRE'
      ? 'bg-amber-100 border border-amber-300 text-amber-800'
      : clasesInterzonalFondo(numero ?? 1)

  const texto = valor === 'LIBRE' ? 'Libre' : labelItem(item)

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md px-3 py-2 ${estilos} font-medium cursor-grab active:cursor-grabbing text-center touch-none ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      {texto}
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
