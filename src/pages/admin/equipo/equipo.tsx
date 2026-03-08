import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import { Shield } from 'lucide-react'
import Tabla from './tabla'

export default function EquipoHome() {
  const { data, isLoading, isError } = useApiQuery({
    key: ['equipos'],
    fn: async () => await api.equipoAll()
  })

  return (
    <FlujoHomeLayout
      titulo='Equipos'
      iconoTitulo={<Shield className='h-8 w-8 text-primary' />}
      ocultarBotonVolver
      contenido={
        <Tabla data={data || []} isLoading={isLoading} isError={isError} />
      }
    />
  )
}
