import { api } from '@/api/api'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import TablaTorneo from './components/tabla'

export default function Torneo() {
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['torneos'],
    queryFn: async () => {
      const response = await api.torneoAll()
      return response
    }
  })

  return (
    <FlujoHomeLayout
      titulo='Torneos'
      iconoTitulo='Torneos'
      ocultarBotonVolver
      botonera={{
        iconos: [
          {
            alApretar: () => navigate(rutasNavegacion.crearTorneo),
            tooltip: 'Crear Torneo',
            icono: 'Agregar',
            visibleSoloParaAdmin: true
          }
        ]
      }}
      contenido={
        <TablaTorneo
          data={data || []}
          isLoading={isLoading}
          isError={isError}
        />
      }
    />
  )
}
