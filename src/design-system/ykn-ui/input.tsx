import * as React from 'react'
import { cn } from '@/logica-compartida/utils'
import { Input as BaseInput } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import Icono, { type NombreIcono } from '@/design-system/ykn-ui/icono'

interface InputProps extends React.ComponentProps<typeof BaseInput> {
  error?: string
  titulo?: string
  tipo?: React.ComponentProps<typeof BaseInput>['type']
  icono?: NombreIcono
}

const claseSinFlechasNumber =
  '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&]:[-moz-appearance:textfield]'

function Input({
  className,
  error,
  titulo,
  tipo,
  icono,
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
      <div className='relative'>
        {icono && (
          <Icono
            nombre={icono}
            className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground'
          />
        )}
        <BaseInput
          id={id}
          type={typeEfectivo}
          className={cn(
            'h-11',
            icono && 'pl-10',
            error && 'border-destructive',
            typeEfectivo === 'number' && claseSinFlechasNumber,
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
      </div>
      {error && <p className='text-sm text-destructive mt-1'>{error}</p>}
    </div>
  )
}

export { Input }
