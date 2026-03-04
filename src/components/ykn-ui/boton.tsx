import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

type BotonProps = React.ComponentProps<typeof Button> & {
  estaCargando?: boolean
}

const Boton = React.forwardRef<HTMLButtonElement, BotonProps>(
  (
    { estaCargando = false, children, disabled, className, ...props },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || estaCargando}
        className={cn('relative', className)}
        {...props}
      >
        {estaCargando ? (
          <Loader2 className='size-4 shrink-0 animate-spin' />
        ) : (
          children
        )}
      </Button>
    )
  }
)

Boton.displayName = 'Boton'

export { Boton }
