import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

type BotonProps = React.ComponentProps<typeof Button> & {
  estaCargando?: boolean
}

function Boton({
  estaCargando = false,
  children,
  disabled,
  ...props
}: BotonProps) {
  return (
    <Button
      disabled={disabled || estaCargando}
      className={cn('relative', props.className)}
      {...props}
    >
      {estaCargando ? <Loader2 className='size-4 animate-spin' /> : children}
    </Button>
  )
}

export { Boton }
