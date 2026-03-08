import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/design-system/base-ui/select'
import { Label } from '@/design-system/base-ui/label'

interface OpcionZona {
  id: string
  nombre: string
  detalle: string
}

interface SelectorDeZonaProps {
  zonas: OpcionZona[]
  zonaSeleccionadaId: string
  alCambiarZona: (zonaId: string) => void
  etiqueta: string
}

export function SelectorDeZona({
  zonas,
  zonaSeleccionadaId,
  alCambiarZona,
  etiqueta
}: SelectorDeZonaProps) {
  return (
    <div className='mb-4'>
      <Label className='text-xs text-muted-foreground block mb-2'>
        {etiqueta}
      </Label>
      <Select value={zonaSeleccionadaId} onValueChange={alCambiarZona}>
        <SelectTrigger>
          <SelectValue placeholder='Seleccionar zona' />
        </SelectTrigger>
        <SelectContent>
          {zonas.map((zona) => (
            <SelectItem key={zona.id} value={zona.id}>
              {zona.nombre} — {zona.detalle}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
