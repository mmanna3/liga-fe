import { EquipoDTO } from '@/api/clients'
import { Checkbox } from '@/design-system/base-ui/checkbox'
import { cn } from '@/logica-compartida/utils'

interface RenglonBuscadorDeEquiposProps {
  equipo: EquipoDTO
  seleccionMultipleActiva: boolean
  idsSeleccionados: Set<number>
  onToggleSeleccion: (equipoId: number) => void
  onDragStart: (e: React.DragEvent, equipo: EquipoDTO) => void
}

export function RenglonBuscadorDeEquipos({
  equipo,
  seleccionMultipleActiva,
  idsSeleccionados,
  onToggleSeleccion,
  onDragStart
}: RenglonBuscadorDeEquiposProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, equipo)}
      onClick={
        seleccionMultipleActiva && equipo.id != null
          ? () => onToggleSeleccion(equipo.id!)
          : undefined
      }
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-2 bg-background',
        'cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors',
        seleccionMultipleActiva && 'cursor-pointer'
      )}
    >
      {seleccionMultipleActiva && (
        <span
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={idsSeleccionados.has(equipo.id ?? 0)}
            onCheckedChange={() =>
              equipo.id != null && onToggleSeleccion(equipo.id)
            }
            className='rounded-full h-4 w-4 shrink-0'
          />
        </span>
      )}
      <span className='font-mono text-sm text-muted-foreground shrink-0'>
        {equipo.codigoAlfanumerico ?? '—'}
      </span>
      <span className='font-medium truncate'>{equipo.nombre ?? '—'}</span>
      <span className='text-muted-foreground text-sm truncate'>
        {equipo.clubNombre ?? '—'}
      </span>
      <span className='text-muted-foreground text-sm truncate'>
        {equipo.torneo ? `(${equipo.torneo} ·` : ''}{' '}
        {equipo.fase ? `${equipo.fase} ·` : ''}{' '}
        {equipo.zonaExcluyente ? `${equipo.zonaExcluyente})` : ''}
      </span>
    </div>
  )
}
