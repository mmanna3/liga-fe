import * as React from 'react'
import { cn } from '@/logica-compartida/utils'
import { Input as BaseInput } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'

interface InputProps extends React.ComponentProps<typeof BaseInput> {
  error?: string
  titulo?: string
  tipo?: React.ComponentProps<typeof BaseInput>['type']
}

const claseSinFlechasNumber =
  '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&]:[-moz-appearance:textfield]'

function Input({
  className,
  error,
  titulo,
  tipo,
  id,
  type,
  ...props
}: InputProps) {
  const typeEfectivo = tipo ?? type
  return (
    <div>
      {titulo && (
        <Label htmlFor={id} className='block mb-2 text-md font-semibold'>
          {titulo}
        </Label>
      )}
      <BaseInput
        id={id}
        type={typeEfectivo}
        className={cn(
          'h-11',
          error && 'border-destructive',
          typeEfectivo === 'number' && claseSinFlechasNumber,
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className='text-sm text-destructive mt-1'>{error}</p>}
    </div>
  )
}

export { Input }
