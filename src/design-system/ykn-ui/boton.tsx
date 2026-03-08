import { Button } from '@/design-system/base-ui/button'
import Icono from '@/design-system/ykn-ui/icono'
import { cn } from '@/logica-compartida/utils'
import * as React from 'react'

type BotonProps = React.ComponentProps<typeof Button> & {
  estaCargando?: boolean
}

const Boton = React.forwardRef<HTMLButtonElement, BotonProps>(
  (
    { estaCargando = false, children, disabled, className, asChild, ...props },
    ref
  ) => {
    const contenido =
      asChild || !estaCargando ? (
        children
      ) : (
        <Icono nombre='Cargando' className='size-4 shrink-0 animate-spin' />
      )
    return (
      <Button
        ref={ref}
        disabled={disabled || estaCargando}
        className={cn('relative', className)}
        asChild={asChild}
        {...props}
      >
        {contenido}
      </Button>
    )
  }
)

Boton.displayName = 'Boton'

export { Boton }
