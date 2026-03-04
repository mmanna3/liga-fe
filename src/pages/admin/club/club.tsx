import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Button } from '@/components/ui/button'
import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import { VisibleSoloParaAdmin } from '@/components/visible-solo-para-admin'
import { rutasNavegacion } from '@/routes/rutas'
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
      panelDerecho={
        <VisibleSoloParaAdmin>
          <Button onClick={() => navigate(rutasNavegacion.crearClub)}>
            Crear nuevo club
          </Button>
        </VisibleSoloParaAdmin>
      }
      contenido={
        <Tabla data={data || []} isLoading={isLoading} isError={isError} />
      }
    />
  )
}
