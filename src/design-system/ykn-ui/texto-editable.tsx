import { Input as BaseInput } from '@/design-system/base-ui/input'
import Icono from '@/design-system/ykn-ui/icono'
import { cn } from '@/logica-compartida/utils'
import { useEffect, useRef, useState } from 'react'

interface TextoEditableProps {
  valor: string
  alCambiar: (v: string) => void
  /** Llamado al perder el foco (confirmar edición) con el valor final */
  alConfirmar?: (v: string) => void
  /** Tamaño visual: 'detalle' (texto chico), 'default', 'titulo' (texto grande) */
  tamanio?: 'detalle' | 'default' | 'titulo'
  /** Texto mostrado cuando valor está vacío */
  valorPorDefecto?: string
  /** Si se provee, se muestra como "etiqueta: valor" (ej. "DNI: 123") */
  etiqueta?: string
  /** Placeholder del input cuando está en modo edición */
  placeholder?: string
  className?: string
  /** Si true, solo muestra el texto sin posibilidad de editar */
  soloLectura?: boolean
}

const TAMANIO_CLASSES = {
  detalle: {
    texto: 'text-sm text-muted-foreground',
    lapiz: 'w-3 h-3 ml-1',
    input: 'max-w-48 text-sm'
  },
  default: {
    texto: 'text-base font-medium',
    lapiz: 'w-4 h-4 ml-1.5',
    input: 'max-w-xs'
  },
  titulo: {
    texto: 'text-3xl font-semibold text-foreground',
    lapiz: 'w-5 h-5 ml-1 mt-1',
    input: 'max-w-32 text-center text-lg font-semibold'
  }
} as const

function textoAMostrar(
  valor: string,
  valorPorDefecto?: string,
  etiqueta?: string
): string {
  const v = valor || valorPorDefecto || '—'
  return etiqueta ? `${etiqueta}: ${v}` : v
}

export function TextoEditable({
  valor,
  alCambiar,
  alConfirmar,
  tamanio = 'default',
  valorPorDefecto,
  etiqueta,
  placeholder,
  className,
  soloLectura = false
}: TextoEditableProps) {
  const [esEdicion, setEsEdicion] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const clases = TAMANIO_CLASSES[tamanio]

  useEffect(() => {
    if (esEdicion && inputRef.current) {
      inputRef.current.focus()
    }
  }, [esEdicion])

  if (soloLectura) {
    return (
      <span className={cn(clases.texto, className)}>
        {textoAMostrar(valor, valorPorDefecto, etiqueta)}
      </span>
    )
  }

  if (!esEdicion) {
    return (
      <div
        className={cn(
          'flex items-center gap-0.5 group cursor-pointer',
          'hover:text-primary [&_.icono-lapiz]:hover:opacity-100',
          className
        )}
        onClick={() => setEsEdicion(true)}
      >
        <span
          className={cn(
            clases.texto,
            'group-hover:text-primary group-hover:font-semibold'
          )}
        >
          {textoAMostrar(valor, valorPorDefecto, etiqueta)}
        </span>
        <Icono
          nombre='Editar'
          className={cn(
            clases.lapiz,
            'text-muted-foreground hidden group-hover:block group-hover:text-primary shrink-0'
          )}
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
      className={cn(clases.input, className)}
      value={valor}
      onChange={(e) => alCambiar(e.target.value)}
      onBlur={() => {
        setEsEdicion(false)
        alConfirmar?.(valor)
      }}
      placeholder={placeholder}
    />
  )
}
