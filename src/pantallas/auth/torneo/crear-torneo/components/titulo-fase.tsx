import { Input as BaseInput } from '@/design-system/base-ui/input'
import Icono from '@/design-system/ykn-ui/icono'
import { useEffect, useRef, useState } from 'react'

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
  const [esEdicion, setEsEdicion] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (esEdicion && inputRef.current) {
      inputRef.current.focus()
    }
  }, [esEdicion])

  const circuloNumero =
    numero != null ? (
      <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white'>
        {numero}
      </span>
    ) : null

  if (soloLectura) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ''}`}>
        {circuloNumero}
        <h3 className='text-lg font-semibold'>{valor || 'Sin nombre'}</h3>
      </div>
    )
  }

  if (!esEdicion) {
    return (
      <div
        className={`flex items-center gap-2 group cursor-pointer ${className ?? ''}`}
        onClick={() => setEsEdicion(true)}
      >
        {circuloNumero}
        <h3 className='text-lg font-semibold group-hover:text-primary'>
          {valor || 'Primera Fase'}
        </h3>
        <Icono
          nombre='Editar'
          className='w-4 h-4 text-muted-foreground group-hover:text-primary'
        />
      </div>
    )
  }

  return (
    <div className='flex items-center gap-2'>
      {circuloNumero}
      <BaseInput
        ref={(el) => {
          inputRef.current = el
          if (el) el.focus()
        }}
        className='text-lg font-semibold max-w-xs'
        value={valor}
        onChange={(e) => alCambiar?.(e.target.value)}
        onBlur={() => setEsEdicion(false)}
      />
    </div>
  )
}
