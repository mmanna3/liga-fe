import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import { rutasNavegacion } from '@/routes/rutas'
import { useNavigate, useParams } from 'react-router-dom'

export default function DetalleClub() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    data: club,
    isError,
    isLoading
  } = useApiQuery({
    key: ['club', id],
    fn: async () => await api.clubGET(Number(id))
  })

  if (isError) {
    return (
      <Alert variant='destructive' className='mb-4'>
        <AlertTitle className='text-xl font-semibold'>Error</AlertTitle>
        <AlertDescription>
          No se pudieron recuperar los datos del club.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className='max-w-md mx-auto mt-10'>
        <Skeleton className='h-16 w-64' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
      </div>
    )
  }

  return (
    <Card className='max-w-md mx-auto mt-10 p-4'>
      <CardHeader>
        <CardTitle>{club!.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        <Botonera>
          <Button
            onClick={() => navigate(`${rutasNavegacion.crearEquipo}/${id}`)}
          >
            Crear nuevo equipo
          </Button>
        </Botonera>
        <h2 className='text-xl font-bold'>Equipos</h2>
        <ul className='list-disc list-inside'>
          {club!.equipos!.map((equipo) => (
            <li key={equipo.id}>{equipo.nombre}</li>
          ))}
        </ul>
      </CardContent>
      <Botonera>
        <BotonVolver path={rutasNavegacion.clubs} />
      </Botonera>
    </Card>
  )
}
