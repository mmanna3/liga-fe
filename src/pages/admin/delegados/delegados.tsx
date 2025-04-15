import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VisibleSoloParaAdmin } from '@/components/visible-solo-para-admin'
import { rutasNavegacion } from '@/routes/rutas'
import { useNavigate } from 'react-router-dom'
import TablaDelegados from './tabla'

export default function Delegados() {
  const navigate = useNavigate()

  const {
    data: delegados,
    isError,
    isLoading
  } = useApiQuery({
    key: ['delegados'],
    fn: async () => await api.delegadoAll()
  })

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Delegados</CardTitle>
        <VisibleSoloParaAdmin>
          <Button onClick={() => navigate(rutasNavegacion.crearDelegado)}>
            Crear Delegado
          </Button>
        </VisibleSoloParaAdmin>
      </CardHeader>
      <CardContent>
        <TablaDelegados
          data={delegados || []}
          isLoading={isLoading}
          isError={isError}
        />
      </CardContent>
    </Card>
  )
}
