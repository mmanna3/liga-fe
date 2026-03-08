import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import { rutasNavegacion } from '@/routes/rutas'
import Icono from '@/components/ykn-ui/icono'
import { useNavigate } from 'react-router-dom'
import Tabla from './tabla'

export default function Club() {
  const navigate = useNavigate()

  const { data, isLoading, isError } = useApiQuery({
    key: ['clubs'],
    fn: async () => await api.clubAll()
  })

  return (
    <FlujoHomeLayout
      titulo='Clubes'
      iconoTitulo={<Icono nombre='Clubes' className='h-8 w-8 text-primary' />}
      ocultarBotonVolver
      botonera={{
        iconos: [
          {
            alApretar: () => navigate(rutasNavegacion.crearClub),
            tooltip: 'Crear nuevo club',
            icono: 'Agregar',
            visibleSoloParaAdmin: true
          }
        ]
      }}
      contenido={
        <Tabla data={data || []} isLoading={isLoading} isError={isError} />
      }
    />
  )
}
