import { api } from '@/api/api'
import { Button } from '@/components/ui/button'
import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import { VisibleSoloParaAdmin } from '@/components/visible-solo-para-admin'
import { rutasNavegacion } from '@/routes/rutas'
import { useQuery } from '@tanstack/react-query'
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
      panelDerecho={
        <VisibleSoloParaAdmin>
          <Button onClick={() => navigate(rutasNavegacion.crearTorneo)}>
            Crear Torneo
          </Button>
        </VisibleSoloParaAdmin>
      }
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
