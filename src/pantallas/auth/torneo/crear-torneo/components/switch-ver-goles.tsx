import { Label } from '@/design-system/base-ui/label'
import { Switch } from '@/design-system/base-ui/switch'

interface SwitchVerGolesProps {
  id?: string
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  className?: string
}

export function SwitchVerGoles({
  id = 'seVenLosGolesEnTablaDePosiciones',
  value,
  onChange,
  disabled,
  className
}: SwitchVerGolesProps) {
  return (
    <div className={className}>
      <Label className='block mb-2 text-md font-semibold' htmlFor={id}>
        Ver goles en tablas de posiciones
      </Label>
      <Switch
        className='block'
        id={id}
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
        textoPrendido='Sí'
        textoApagado='No'
      />
    </div>
  )
}
