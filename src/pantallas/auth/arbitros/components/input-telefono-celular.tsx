import { Label } from '@/design-system/base-ui/label'
import Icono from '@/design-system/ykn-ui/icono'
import { cn } from '@/logica-compartida/utils'
import { PREFIJO_TELEFONO_CELULAR_VISIBLE } from '../utilidades-telefono-celular'

interface InputTelefonoCelularProps {
  id?: string
  valor: string
  error?: string
  onChange: (valor: string) => void
}

export default function InputTelefonoCelular({
  id = 'telefonoCelular',
  valor,
  error,
  onChange
}: InputTelefonoCelularProps) {
  return (
    <div>
      <Label htmlFor={id} className='block mb-2 text-md font-semibold'>
        Teléfono celular
      </Label>
      <div
        className={cn(
          'flex h-11 w-full min-w-0 overflow-hidden rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
          error
            ? 'border-destructive aria-invalid:ring-destructive/20'
            : 'border-input'
        )}
      >
        <span className='flex items-center pl-3 pr-2 text-muted-foreground'>
          <Icono nombre='Teléfono' className='h-4 w-4 shrink-0' />
        </span>
        <span className='flex items-center border-r border-input bg-muted px-3 text-sm font-medium text-foreground select-none'>
          {PREFIJO_TELEFONO_CELULAR_VISIBLE}
        </span>
        <input
          id={id}
          type='text'
          inputMode='numeric'
          autoComplete='tel-national'
          placeholder='12345678'
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          maxLength={8}
          aria-invalid={!!error}
          className='h-full min-w-0 flex-1 border-0 bg-transparent pl-2 pr-3 py-1 text-base outline-none md:text-sm placeholder:text-muted-foreground'
        />
      </div>
      {error && <p className='text-sm text-destructive mt-1'>{error}</p>}
    </div>
  )
}
