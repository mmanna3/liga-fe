import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import Icono from '@/design-system/ykn-ui/icono'
import Tabla from './tabla'

export default function EquipoHome() {
  const { data, isLoading, isError } = useApiQuery({
    key: ['equipos'],
    fn: async () => await api.equipoAll()
  })

  return (
    <FlujoHomeLayout
      titulo='Equipos'
      iconoTitulo={<Icono nombre='Equipos' className='h-8 w-8 text-primary' />}
      ocultarBotonVolver
      contenido={
        <Tabla data={data || []} isLoading={isLoading} isError={isError} />
      }
    />
  )
}
