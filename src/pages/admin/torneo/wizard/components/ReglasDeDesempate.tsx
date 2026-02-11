import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

interface ReglasDeDesempateProps {
  tiebreakers: string[]
  editable: boolean
  onReorder: (fromIndex: number, toIndex: number) => void
}

export function ReglasDeDesempate({
  tiebreakers,
  editable,
  onReorder
}: ReglasDeDesempateProps) {
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (dragIndex !== dropIndex) {
      onReorder(dragIndex, dropIndex)
    }
  }

  return (
    <div className='my-3'>
      <Label className='block mb-2 text-md font-semibold'>
        Reglas de desempate
      </Label>
      <p className='text-xs text-muted-foreground mb-2'>
        Arrastra para ordenar por prioridad
      </p>
      <div className='space-y-1.5'>
        {tiebreakers.map((rule, index) => (
          <div
            key={index}
            draggable={editable}
            onDragStart={(e) => editable && handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => editable && handleDrop(e, index)}
            className={cn(
              'flex items-center gap-2 p-2 bg-muted rounded-lg border transition-colors',
              editable ? 'cursor-move hover:bg-accent' : 'cursor-not-allowed'
            )}
          >
            <GripVertical className='w-4 h-4 text-muted-foreground' />
            <span className='w-5 h-5 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold'>
              {index + 1}
            </span>
            <span className='text-sm font-medium'>{rule}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
