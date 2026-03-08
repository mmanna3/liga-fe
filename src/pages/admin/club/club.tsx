import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import { rutasNavegacion } from '@/routes/rutas'
import { Plus } from 'lucide-react'
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
      botonera={{
        ocultarBotonVolver: true,
        iconos: [
          {
            alApretar: () => navigate(rutasNavegacion.crearClub),
            tooltip: 'Crear nuevo club',
            icono: Plus,
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
