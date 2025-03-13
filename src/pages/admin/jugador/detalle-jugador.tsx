import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import { EstadoJugador } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { useNavigate, useParams } from 'react-router-dom'

export default function DetalleJugador() {
  const navigate = useNavigate()
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
    <Card className='max-w-lg mx-auto mt-10 p-6 rounded-xl border bg-white'>
      <CardHeader className='flex flex-col items-center text-center'>
        <img
          src={jugador!.fotoCarnet}
          alt={`${jugador!.nombre} ${jugador!.apellido}`}
          className='w-32 h-32 rounded-lg object-cover'
        />
        <CardTitle className='mt-4 text-3xl font-semibold text-gray-900'>
          {jugador!.nombre} {jugador!.apellido}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className='flex flex-col gap-1 bg-gray-50 p-5 rounded-lg mb-6'>
          <DetalleItem clave='DNI' valor={jugador!.dni!} />
          <DetalleItem
            clave='Fecha de nacimiento'
            valor={jugador!.fechaNacimiento!.toLocaleDateString('es-AR')}
          />
        </div>

        <h2 className='text-lg font-medium mt-6 mb-4 text-gray-700'>Equipos</h2>
        <ul className='divide-y divide-gray-200'>
          {jugador!.equipos!.map((equipo) => (
            <li
              key={equipo.id}
              className='py-3 flex justify-between items-center'
            >
              <div>
                <span className='text-lg font-medium text-gray-900'>
                  {equipo.nombre}
                </span>
                <div className='text-sm text-gray-600'>{equipo.club}</div>
              </div>
              <div className='flex items-center gap-4'>
                <JugadorEquipoEstadoBadge estado={Number(equipo.estado)} />
                {
                  <Button
                    variant='ghost'
                    className='text-blue-600'
                    onClick={() => {
                      if (
                        Number(equipo.estado) ===
                          EstadoJugador.FichajePendienteDeAprobacion ||
                        Number(equipo.estado) === EstadoJugador.FichajeRechazado
                      )
                        navigate(
                          `${rutasNavegacion.aprobarRechazarJugador}/${equipo.id}/${jugador!.id}`
                        )
                      else
                        navigate(
                          `${rutasNavegacion.cambiarEstadoJugador}/${equipo.id}/${jugador!.id}`
                        )
                    }}
                  >
                    Gestionar
                  </Button>
                }
              </div>
            </li>
          ))}
        </ul>
      </CardContent>

      <div className='flex justify-end mt-6'>
        <BotonVolver texto='Volver' />
      </div>
    </Card>
  )
}
