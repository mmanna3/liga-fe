import { EquipoDTO } from '@/api/clients'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/design-system/base-ui/tooltip'
import { TextoEditable } from '@/design-system/ykn-ui/texto-editable'
import { cn } from '@/logica-compartida/utils'
import { X } from 'lucide-react'
import type { ZonaEstado } from './tipos-zona'

function textoEquipoCompleto(eq: EquipoDTO): string {
  const partes: string[] = []
  if (eq.codigoAlfanumerico) partes.push(eq.codigoAlfanumerico)
  partes.push(eq.nombre ?? '—')
  if (eq.clubNombre) partes.push(`(${eq.clubNombre})`)
  return partes.join(' ')
}

interface DetalleZonasDeLaFaseProps {
  zona: ZonaEstado
  onNombreChange: (nombre: string) => void
  onQuitarEquipo: (equipoId: number) => void
  onDropEquipo: (equipo: EquipoDTO) => void
  editable?: boolean
}

export function DetalleZonasDeLaFase({
  zona,
  onNombreChange,
  onQuitarEquipo,
  onDropEquipo,
  editable = true
}: DetalleZonasDeLaFaseProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('application/json')
    if (data) {
      try {
        const equipo = JSON.parse(data) as EquipoDTO
        onDropEquipo(equipo)
      } catch {
        // ignore
      }
    }
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-dotted p-4 bg-muted/30 min-h-[120px]',
        'transition-colors'
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className='mb-3'>
        {editable ? (
          <TextoEditable
            valor={zona.nombre}
            alCambiar={onNombreChange}
            tamanio='default'
            placeholder='Nombre de la zona'
          />
        ) : (
          <p className='font-semibold text-lg'>{zona.nombre}</p>
        )}
      </div>
      <div className='space-y-2'>
        {zona.equipos.map((eq) => (
          <Tooltip key={eq.id}>
            <TooltipTrigger asChild>
              <div className='flex items-center justify-between gap-2 rounded-md bg-background px-3 py-2 border text-sm cursor-default'>
                <span className='truncate'>
                  {eq.codigoAlfanumerico && (
                    <span className='font-mono text-muted-foreground mr-2'>
                      {eq.codigoAlfanumerico}
                    </span>
                  )}
                  {eq.nombre ?? '—'}
                  {eq.clubNombre && (
                    <span className='text-muted-foreground ml-1'>
                      ({eq.clubNombre})
                    </span>
                  )}
                </span>
                {editable && (
                  <button
                    type='button'
                    onClick={() => eq.id != null && onQuitarEquipo(eq.id)}
                    className='shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors'
                    aria-label='Quitar equipo'
                  >
                    <X className='h-4 w-4' />
                  </button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side='top' className='max-w-sm'>
              <p className='whitespace-normal'>{textoEquipoCompleto(eq)}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
