import { Label } from '@/design-system/base-ui/label'
import { cn } from '@/logica-compartida/utils'

export interface OpcionSelector {
  id: string
  titulo: string
  descripcion?: string
}

interface SelectorSimpleProps {
  opciones: OpcionSelector[]
  valorActual: string
  alElegirOpcion: (id: string) => void
  deshabilitado?: boolean
  tamano?: 'default' | 'sm'
  className?: string
  titulo?: string
  /** Máximo de opciones por renglón (usa grid). Si no se provee, usa el layout por defecto. */
  columnasPorRenglon?: number
}

export default function SelectorSimple({
  opciones,
  valorActual,
  alElegirOpcion,
  deshabilitado = false,
  tamano = 'default',
  className,
  titulo,
  columnasPorRenglon
}: SelectorSimpleProps) {
  const gridClass =
    columnasPorRenglon != null
      ? ({
          2: 'grid grid-cols-2 gap-2',
          3: 'grid grid-cols-3 gap-2',
          4: 'grid grid-cols-4 gap-2'
        }[columnasPorRenglon] ?? 'flex gap-2')
      : opciones.length === 4
        ? 'grid grid-cols-2 md:grid-cols-4 gap-2'
        : 'flex gap-2'

  const contenido = (
    <div className={cn(gridClass, className)}>
      {opciones.map((opcion) => {
        const seleccionado = valorActual === opcion.id
        return (
          <button
            key={opcion.id}
            type='button'
            onClick={() => !deshabilitado && alElegirOpcion(opcion.id)}
            disabled={deshabilitado}
            className={cn(
              'rounded-lg transition-all border-2 flex flex-col items-center justify-center flex-1 min-w-0',
              tamano === 'sm'
                ? 'py-1.5 px-2 text-sm'
                : 'py-3 px-3 text-sm font-semibold',
              'font-medium leading-tight',
              seleccionado
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-muted border-transparent text-muted-foreground hover:border-border',
              deshabilitado && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span>{opcion.titulo}</span>
            {opcion.descripcion && (
              <span
                className={cn(
                  'text-xs font-normal mt-0.5',
                  seleccionado
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                )}
              >
                {opcion.descripcion}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )

  if (titulo) {
    return (
      <div className={cn('flex-1', className)}>
        <Label className='block mb-2 text-md font-semibold'>{titulo}</Label>
        {contenido}
      </div>
    )
  }

  return contenido
}
