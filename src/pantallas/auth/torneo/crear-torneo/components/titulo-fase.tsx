import { TextoEditable } from '@/design-system/ykn-ui/texto-editable'
import { cn } from '@/logica-compartida/utils'

interface TituloFaseProps {
  valor: string
  alCambiar?: (v: string) => void
  className?: string
  /** Si true, solo muestra el texto sin posibilidad de editar */
  soloLectura?: boolean
  /** Número de la fase. Si se provee, se muestra en un círculo a la izquierda */
  numero?: number
}

export function TituloFase({
  valor,
  alCambiar,
  className,
  soloLectura = false,
  numero
}: TituloFaseProps) {
  const circuloNumero =
    numero != null ? (
      <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white'>
        {numero}
      </span>
    ) : null

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {circuloNumero}
      <TextoEditable
        valor={valor}
        alCambiar={alCambiar ?? (() => {})}
        tamanio='default'
        valorPorDefecto={soloLectura ? 'Sin nombre' : 'Primera Fase'}
        soloLectura={soloLectura}
        className={cn(soloLectura && 'text-lg font-semibold')}
      />
    </div>
  )
}
