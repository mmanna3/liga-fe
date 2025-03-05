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
      <Alert variant='destructive' className='mb-4 max-w-md mx-auto'>
        <AlertTitle className='text-xl font-semibold'>Error</AlertTitle>
        <AlertDescription>
          No se pudieron recuperar los datos del jugador.
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
    <Card className='max-w-md mx-auto mt-10 p-6 shadow-lg rounded-xl border'>
      <CardHeader className='flex flex-col items-center text-center'>
        <div className='w-32 h-32 rounded-full overflow-hidden shadow-md border'>
          <img
            src={jugador!.fotoCarnet}
            alt={`${jugador!.nombre} ${jugador!.apellido}`}
            className='w-full h-full object-cover'
          />
        </div>
        <CardTitle className='mt-4 text-2xl font-bold'>
          {jugador!.nombre} {jugador!.apellido}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className='bg-gray-100 p-4 rounded-lg shadow-sm mb-4'>
          <DetalleItem clave='DNI' valor={jugador!.dni!} />
          <DetalleItem
            clave='Fecha de nacimiento'
            valor={jugador!.fechaNacimiento!.toDateString()}
          />
        </div>

        <h2 className='text-lg font-semibold mb-2 text-center'>Equipos</h2>
        <ul className='list-none space-y-2'>
          {jugador!.equipos!.map((e) => (
            <>
              <li
                key={e.id}
                className='p-2 border rounded-lg flex justify-between items-center shadow-sm'
              >
                <span>
                  {e.nombre} - {e.club}
                </span>
                <JugadorEquipoEstadoBadge estado={Number(e.estado)} />
              </li>
            </>
          ))}
        </ul>
      </CardContent>

      <div className='flex justify-center mt-4'>
        <Botonera>
          <BotonVolver texto='Volver' />
        </Botonera>
      </div>
    </Card>
  )
}
