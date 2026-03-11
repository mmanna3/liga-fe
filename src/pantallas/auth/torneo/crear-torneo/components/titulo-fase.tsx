import { Input as BaseInput } from '@/design-system/base-ui/input'
import Icono from '@/design-system/ykn-ui/icono'
import { useEffect, useRef, useState } from 'react'

interface TituloFaseProps {
  valor: string
  alCambiar?: (v: string) => void
  className?: string
  /** Si true, solo muestra el texto sin posibilidad de editar */
  soloLectura?: boolean
}

export function TituloFase({
  valor,
  alCambiar,
  className,
  soloLectura = false
}: TituloFaseProps) {
  const [esEdicion, setEsEdicion] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (esEdicion && inputRef.current) {
      inputRef.current.focus()
    }
  }, [esEdicion])

  if (soloLectura) {
    return (
      <h3 className={`text-lg font-semibold ${className ?? ''}`}>
        {valor || 'Sin nombre'}
      </h3>
    )
  }

  if (!esEdicion) {
    return (
      <div
        className={`flex items-center gap-1.5 group cursor-pointer ${className ?? ''}`}
        onClick={() => setEsEdicion(true)}
      >
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
  )
}
