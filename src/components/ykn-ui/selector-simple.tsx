import { cn } from '@/lib/utils'

export interface OpcionSelector {
  id: string
  texto: string
}

interface SelectorSimpleProps {
  opciones: OpcionSelector[]
  valorActual: string
  alElegirOpcion: (id: string) => void
  deshabilitado?: boolean
  tamano?: 'default' | 'sm'
  className?: string
}

export default function SelectorSimple({
  opciones,
  valorActual,
  alElegirOpcion,
  deshabilitado = false,
  tamano = 'default',
  className
}: SelectorSimpleProps) {
  return (
    <div
      className={cn(
        opciones.length === 4
          ? 'grid grid-cols-2 md:grid-cols-4 gap-2'
          : 'flex gap-2',
        className
      )}
    >
      {opciones.map((opcion) => {
        const seleccionado = valorActual === opcion.id
        return (
          <button
            key={opcion.id}
            type='button'
            onClick={() => !deshabilitado && alElegirOpcion(opcion.id)}
            disabled={deshabilitado}
            className={cn(
              'rounded-lg transition-all border-2 flex items-center justify-center flex-1 min-w-0',
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
            {opcion.texto}
          </button>
        )
      })}
    </div>
  )
}
