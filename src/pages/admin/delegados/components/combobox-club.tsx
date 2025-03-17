import { api } from '@/api/api'
import { ClubDTO } from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface ComboboxClubProps {
  value: number | null
  onChange: (value: number | null) => void
  required?: boolean
}

export function ComboboxClub({ value, onChange, required }: ComboboxClubProps) {
  const { data: clubs } = useApiQuery<ClubDTO[]>({
    key: ['clubs'],
    fn: async () => await api.clubAll()
  })

  return (
    <Select
      value={value?.toString() || ''}
      onValueChange={(value) => onChange(value ? Number(value) : null)}
      required={required}
    >
      <SelectTrigger>
        <SelectValue placeholder='Seleccionar club...' />
      </SelectTrigger>
      <SelectContent>
        {clubs?.map((club: ClubDTO) => (
          <SelectItem key={club.id} value={club.id?.toString() || ''}>
            {club.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 