import { api } from '@/api/api'
import { EstadoJugadorEnum, GestionarJugadorDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import { EstadoJugador } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function AprobarRechazarJugador() {
  const navigate = useNavigate()
  const { jugadorequipoid } = useParams<{ jugadorequipoid: string }>()
  const { jugadorid } = useParams<{ jugadorid: string }>()

  const {
    data: jugador,
    isError,
    isLoading
  } = useApiQuery({
    key: ['jugador', jugadorid],
    fn: async () => await api.jugadorGET(Number(jugadorid))
  })

  const mutation = useApiMutation({
    fn: async (dto: GestionarJugadorDTO) => {
      await api.gestionarJugador(dto)
    },
    antesDeMensajeExito: () =>
      navigate(`${rutasNavegacion.detalleJugador}/${jugadorid}`),
    mensajeDeExito: `Cambios aplicados correctamente`
  })

  const equipo = useMemo(() => {
    if (jugador && jugador.equipos)
      return jugador.equipos.find(
        (equipo) => equipo.id === Number(jugadorequipoid)
      )
  }, [jugador, jugadorequipoid])

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
    <Card className='max-w-3xl mx-auto mt-10 p-6 rounded-xl border bg-white'>
      <CardHeader className='flex flex-col items-center text-center'>
        <img
          src={jugador!.fotoCarnet}
          alt={`${jugador!.nombre} ${jugador!.apellido}`}
          className='w-32 h-32 rounded-lg object-cover'
        />
        <CardTitle className='mt-4 text-3xl font-semibold text-gray-900'>
          {jugador!.nombre} {jugador!.apellido}
        </CardTitle>
        <p className='text-sm text-gray-500'>{jugador!.dni}</p>

        <p className='text-sm text-gray-500'>
          {new Date(jugador!.fechaNacimiento!).toLocaleDateString()}
        </p>
        <p className='text-sm text-gray-500'>
          {equipo?.nombre} - {equipo?.club}
        </p>
      </CardHeader>

      <CardContent>
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-6 text-gray-700'>
            Documentación
          </h2>
          <div className='flex flex-col gap-9'>
            <div className='flex flex-col items-center w-full'>
              <img
                src={jugador!.fotoDNIDorso}
                alt={`${jugador!.nombre} DNI Dorso`}
                className='w-full object-cover rounded-lg mb-2'
              />
              <span className='text-sm text-gray-500'>DNI Dorso</span>
            </div>
            <div className='flex flex-col items-center w-full'>
              <img
                src={jugador!.fotoDNIFrente}
                alt={`${jugador!.nombre} DNI Frente`}
                className='w-full object-cover rounded-lg mb-2'
              />
              <span className='text-sm text-gray-500'>DNI Frente</span>
            </div>
          </div>
        </div>

        <div className='mt-8 mb-6'>
          <div className='flex gap-6'>
            <Button
              variant='default'
              className='w-full'
              onClick={() => {
                mutation.mutate(
                  new GestionarJugadorDTO({
                    jugadorEquipoId: Number(jugadorequipoid),
                    dni: jugador!.dni,
                    estado: EstadoJugador.Activo as unknown as EstadoJugadorEnum
                  })
                )
              }}
            >
              Aprobar
            </Button>
            <Button
              variant='destructive'
              className='w-full'
              onClick={() => {
                // Aquí puedes agregar la lógica para rechazar
              }}
            >
              Rechazar
            </Button>
          </div>
        </div>

        {/* Mostrar cuadro de texto solo si se rechaza */}
        <div className='mt-6'>
          <h3 className='text-lg font-medium mb-2 text-gray-700'>
            Motivo del rechazo
          </h3>
          <Textarea
            placeholder='Escribe el motivo del rechazo...'
            rows={4}
            className='w-full'
            disabled={false} // habilitar solo si el estado es "rechazado"
          />
        </div>
      </CardContent>

      <div className='flex justify-end mt-6'>
        <BotonVolver texto='Volver' />
      </div>
    </Card>
  )
}
