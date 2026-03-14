import { Label } from '@/design-system/base-ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/design-system/base-ui/select'
import { cn } from '@/logica-compartida/utils'

export interface OpcionDesplegable {
  value: string
  label: string
}

export interface ListaDesplegableProps {
  titulo?: string
  opciones: OpcionDesplegable[]
  valor: string
  alCambiar: (valor: string) => void
  placeholder?: string
  deshabilitado?: boolean
  id?: string
  requerido?: boolean
  triggerClassName?: string
  className?: string
}

export function ListaDesplegable({
  titulo,
  opciones,
  valor,
  alCambiar,
  placeholder,
  deshabilitado,
  id,
  requerido,
  triggerClassName,
  className
}: ListaDesplegableProps) {
  const select = (
    <Select
      value={valor}
      onValueChange={alCambiar}
      disabled={deshabilitado}
      required={requerido}
    >
      <SelectTrigger id={id} className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((op) => (
          <SelectItem key={op.value} value={op.value}>
            {op.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  if (!titulo) return select

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>{titulo}</Label>
      {select}
    </div>
  )
}
