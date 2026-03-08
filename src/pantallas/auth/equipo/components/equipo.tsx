import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Tabla from './tabla'

export default function EquipoHome() {
  const { data, isLoading, isError } = useApiQuery({
    key: ['equipos'],
    fn: async () => await api.equipoAll()
  })

  return (
    <FlujoHomeLayout
      titulo='Equipos'
      iconoTitulo='Equipos'
      ocultarBotonVolver
      contenido={
        <Tabla data={data || []} isLoading={isLoading} isError={isError} />
      }
    />
  )
}
