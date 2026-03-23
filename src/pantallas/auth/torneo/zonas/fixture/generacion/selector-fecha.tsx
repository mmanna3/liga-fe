import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Calendario } from '@/design-system/ykn-ui/calendario'

interface FixtureSelectorFechaProps {
  primeraFecha: Date
  onFechaChange: (fecha: Date) => void
}

export function FixtureSelectorFecha({
  primeraFecha,
  onFechaChange
}: FixtureSelectorFechaProps) {
  return (
    <Card className='min-w-0 flex flex-col'>
      <CardHeader>
        <CardTitle className='text-base'>
          ¿Cuándo es la primera fecha?
        </CardTitle>
        <CardDescription>
          Las otras fechas se configurarán el mismo día de la semana que la
          primera fecha para las semanas siguientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calendario
          selected={primeraFecha}
          onSelect={(date) => date && onFechaChange(date)}
        />
      </CardContent>
    </Card>
  )
}
