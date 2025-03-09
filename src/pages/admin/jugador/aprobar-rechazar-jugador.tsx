import { api } from '@/api/api'
import {
  EstadoJugadorEnum,
  GestionarJugadorDTO,
  JugadorDTO
} from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import { EstadoJugador } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { Loader2 } from 'lucide-react' // Spinner
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import AprobarRechazarHeader from './components/aprobar-rechazar-header'

const AprobarRechazarJugador: React.FC = () => {
  const navigate = useNavigate()
  const { jugadorequipoid } = useParams<{ jugadorequipoid: string }>()
  const { jugadorid } = useParams<{ jugadorid: string }>()
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [datosCabecera, setDatosCabecera] = useState<JugadorDTO>()

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
    if (jugador?.equipos)
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
        <AprobarRechazarHeader
          jugador={jugador}
          equipo={equipo}
          onChange={setDatosCabecera}
        />
      </CardHeader>

      <CardContent>
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-6 text-gray-700'>
            Documentación
          </h2>
          <div className='flex flex-col gap-9'>
            <div className='flex flex-col items-center w-full'>
              <img
                src={jugador!.fotoDNIFrente}
                alt={`${jugador!.nombre} DNI Frente`}
                className='w-full object-cover rounded-lg mb-2'
              />
              <span className='text-sm text-gray-500'>DNI Frente</span>
            </div>
            <div className='flex flex-col items-center w-full'>
              <img
                src={jugador!.fotoDNIDorso}
                alt={`${jugador!.nombre} DNI Dorso`}
                className='w-full object-cover rounded-lg mb-2'
              />
              <span className='text-sm text-gray-500'>DNI Dorso</span>
            </div>
          </div>
        </div>

        <div className='mt-8 mb-6'>
          <div className='flex gap-6'>
            <Button
              variant='default'
              className='w-full'
              disabled={mutation.isPending}
              onClick={() => {
                mutation.mutate(
                  new GestionarJugadorDTO({
                    id: jugador!.id,
                    jugadorEquipoId: Number(jugadorequipoid),
                    estado:
                      EstadoJugador.Activo as unknown as EstadoJugadorEnum,
                    dni: datosCabecera!.dni,
                    nombre: datosCabecera!.nombre,
                    apellido: datosCabecera!.apellido,
                    fechaNacimiento: datosCabecera!.fechaNacimiento
                  })
                )
              }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  Procesando...
                </>
              ) : (
                'Aprobar'
              )}
            </Button>

            <Button
              variant='destructive'
              className='w-full'
              disabled={mutation.isPending}
              onClick={() => {
                if (!motivoRechazo) {
                  toast.error('Hay que ingresar un motivo de rechazo.')
                  return
                }

                mutation.mutate(
                  new GestionarJugadorDTO({
                    id: jugador!.id,
                    jugadorEquipoId: Number(jugadorequipoid),
                    estado:
                      EstadoJugador.FichajeRechazado as unknown as EstadoJugadorEnum,
                    motivoRechazo,
                    dni: datosCabecera!.dni,
                    nombre: datosCabecera!.nombre,
                    apellido: datosCabecera!.apellido,
                    fechaNacimiento: datosCabecera!.fechaNacimiento
                  })
                )
              }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  Procesando...
                </>
              ) : (
                'Rechazar'
              )}
            </Button>
          </div>
        </div>

        <div className='mt-6'>
          <h3 className='text-lg font-medium mb-2 text-gray-700'>
            Motivo del rechazo
          </h3>
          <Textarea
            placeholder='Escribe el motivo del rechazo...'
            rows={4}
            className='w-full'
            defaultValue={equipo?.motivoDeRechazo}
            onChange={(e) => setMotivoRechazo(e.target.value)}
          />
        </div>
      </CardContent>

      <div className='flex justify-end mt-6'>
        <BotonVolver texto='Volver' />
      </div>
    </Card>
  )
}

export default AprobarRechazarJugador
