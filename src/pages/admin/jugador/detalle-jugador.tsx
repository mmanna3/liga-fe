import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import { useParams } from 'react-router-dom'

export default function DetalleJugador() {
  const { id } = useParams<{ id: string }>()

  const {
    data: jugador,
    isError,
    isLoading
  } = useApiQuery({
    key: ['jugador', id],
    fn: async () => await api.jugadorGET(Number(id))
  })

  if (isError) {
    return (
      <Alert variant='destructive' className='mb-4'>
        <AlertTitle className='text-xl font-semibold'>Error</AlertTitle>
        <AlertDescription>
          No se pudieron recuperar los datos del equipo.
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
    <Card className='max-w-lg mx-auto mt-10 p-4'>
      <CardHeader className='flex flex-row'>
        <CardTitle>
          {jugador!.nombre} {jugador!.apellido}
        </CardTitle>
        <CardTitle>{jugador!.fotoCarnet}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='mb-4'>
          <DetalleItem clave='DNI' valor={jugador!.dni!} />
          <DetalleItem
            clave='Fecha de nacimiento'
            valor={jugador!.fechaNacimiento!.toDateString()}
          />
        </div>
        <h2 className='text-md font-bold'>Equipos</h2>
        <ul className='list-disc list-inside'>
          {jugador!.equipos!.map((e) => (
            <li key={e.id} className='my-1'>
              {e.nombre} - {e.club}
              <span className='ml-2'>
                <JugadorEquipoEstadoBadge estado={Number(e.estado)} />
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
      <Botonera>
        <BotonVolver texto='Volver' />
      </Botonera>
    </Card>
  )
}
