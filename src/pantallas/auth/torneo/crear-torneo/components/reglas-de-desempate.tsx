import { Label } from '@/design-system/base-ui/label'
import { cn } from '@/logica-compartida/utils'
import { GripVertical } from 'lucide-react'

interface ReglasDeDesempateProps {
  desempates: string[]
  editable: boolean
  alReordenar: (desdeIndice: number, hastaIndice: number) => void
}

export function ReglasDeDesempate({
  desempates,
  editable,
  alReordenar
}: ReglasDeDesempateProps) {
  const alIniciarArrastre = (
    e: React.DragEvent<HTMLDivElement>,
    indice: number
  ) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', indice.toString())
  }

  const alArrastrarSobre = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const alSoltar = (
    e: React.DragEvent<HTMLDivElement>,
    indiceDestino: number
  ) => {
    e.preventDefault()
    const indiceOrigen = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (indiceOrigen !== indiceDestino) {
      alReordenar(indiceOrigen, indiceDestino)
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
        {desempates.map((regla, indice) => (
          <div
            key={indice}
            draggable={editable}
            onDragStart={(e) => editable && alIniciarArrastre(e, indice)}
            onDragOver={alArrastrarSobre}
            onDrop={(e) => editable && alSoltar(e, indice)}
            className={cn(
              'flex items-center gap-2 p-2 bg-muted rounded-lg border transition-colors',
              editable ? 'cursor-move hover:bg-accent' : 'cursor-not-allowed'
            )}
          >
            <GripVertical className='w-4 h-4 text-muted-foreground' />
            <span className='w-5 h-5 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold'>
              {indice + 1}
            </span>
            <span className='text-sm font-medium'>{regla}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
