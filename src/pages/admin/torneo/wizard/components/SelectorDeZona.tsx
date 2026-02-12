import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface ZoneOption {
  id: string
  name: string
  detail: string
}

interface SelectorDeZonaProps {
  zones: ZoneOption[]
  selectedZoneId: string
  onZoneChange: (zoneId: string) => void
  label: string
}

export function SelectorDeZona({
  zones,
  selectedZoneId,
  onZoneChange,
  label
}: SelectorDeZonaProps) {
  return (
    <div className='mb-4'>
      <Label className='text-xs text-muted-foreground block mb-2'>
        {label}
      </Label>
      <Select value={selectedZoneId} onValueChange={onZoneChange}>
        <SelectTrigger>
          <SelectValue placeholder='Seleccionar zona' />
        </SelectTrigger>
        <SelectContent>
          {zones.map((zone) => (
            <SelectItem key={zone.id} value={zone.id}>
              {zone.name} — {zone.detail}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
