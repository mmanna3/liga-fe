import { api } from '@/api/api'
import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import { rutasNavegacion } from '@/routes/rutas'
import { useQuery } from '@tanstack/react-query'
import Icono from '@/components/ykn-ui/icono'
import { useNavigate } from 'react-router-dom'
import TablaTorneo from './tabla'

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
      iconoTitulo={<Icono nombre='Torneos' className='h-8 w-8 text-primary' />}
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
