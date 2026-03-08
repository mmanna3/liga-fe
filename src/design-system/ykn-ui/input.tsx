import * as React from 'react'
import { cn } from '@/logica-compartida/utils'
import { Input as BaseInput } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'

interface InputProps extends Omit<
  React.ComponentProps<typeof BaseInput>,
  'type'
> {
  error?: string
  titulo?: string
  tipo?: React.ComponentProps<typeof BaseInput>['type']
}

function Input({ className, error, titulo, tipo, ...props }: InputProps) {
  return (
    <div>
      {titulo && (
        <Label className='block mb-2 text-md font-semibold'>{titulo}</Label>
      )}
      <BaseInput
        type={tipo}
        className={cn('h-11', error && 'border-destructive', className)}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className='text-sm text-destructive mt-1'>{error}</p>}
    </div>
  )
}

export { Input }
