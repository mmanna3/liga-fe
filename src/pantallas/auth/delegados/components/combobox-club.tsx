import { api } from '@/api/api'
import { ClubListadoDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { ListaDesplegable } from '@/design-system/ykn-ui/lista-desplegable'

interface ComboboxClubProps {
  value: number | null
  onChange: (value: number | null) => void
  required?: boolean
}

export function ComboboxClub({ value, onChange, required }: ComboboxClubProps) {
  const { data: clubs } = useApiQuery<ClubListadoDTO[]>({
    key: ['clubs'],
    fn: async () => await api.clubesListado()
  })

  const opciones = (clubs ?? []).map((club: ClubListadoDTO) => ({
    value: club.id?.toString() || '',
    label: club.nombre ?? ''
  }))

  return (
    <ListaDesplegable
      opciones={opciones}
      valor={value?.toString() || ''}
      alCambiar={(v) => onChange(v ? Number(v) : null)}
      placeholder='Seleccionar club...'
      requerido={required}
    />
  )
}
