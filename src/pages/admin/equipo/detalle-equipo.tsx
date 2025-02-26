import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Botonera from '@/components/ykn-ui/botonera'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import { useParams } from 'react-router-dom'

export default function DetalleEquipo() {
  const { id } = useParams<{ id: string }>()

  const {
    data: equipo,
    isError,
    isLoading
  } = useApiQuery({
    key: ['equipo', id],
    fn: async () => await api.equipoGET(Number(id))
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
    <Card className='max-w-md mx-auto mt-10 p-4'>
      <CardHeader>
        <CardTitle>{equipo!.nombre}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='mb-4'>
          <DetalleItem clave='Club' valor={equipo!.clubNombre!} />
        </div>
        <h2 className='text-md font-bold'>Jugadores</h2>
        <ul className='list-disc list-inside'>
          {equipo!.jugadores!.map((jug) => (
            <li key={jug}>{jug}</li>
          ))}
        </ul>
      </CardContent>
      <Botonera>
        <BotonVolver texto='Cancelar' />
      </Botonera>
    </Card>
  )
}
