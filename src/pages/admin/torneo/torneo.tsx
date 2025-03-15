import { api } from '@/api/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>Torneos</CardTitle>
        <Button onClick={() => navigate(rutasNavegacion.crearTorneo)}>
          Crear Torneo
        </Button>
      </CardHeader>
      <CardContent>
        <TablaTorneo data={data || []} isLoading={isLoading} isError={isError} />
      </CardContent>
    </Card>
  )
} 