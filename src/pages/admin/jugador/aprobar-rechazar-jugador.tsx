import { api } from '@/api/api'
import {
  AprobarJugadorDTO,
  JugadorDTO,
  RechazarJugadorDTO
} from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { ContenedorCargandoYError } from '@/components/cargando-y-error-contenedor'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Boton } from '@/components/ykn-ui/boton'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import AprobarRechazarHeader from './components/aprobar-rechazar-header'

const AprobarRechazarJugador: React.FC = () => {
  const navigate = useNavigate()
  const { jugadorequipoid, jugadorid } = useParams<{
    jugadorequipoid: string
    jugadorid: string
  }>()
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

  const aprobarMutation = useApiMutation({
    fn: async (dto: AprobarJugadorDTO) => {
      await api.aprobarJugador(dto)
    },
    antesDeMensajeExito: () => navigate(-1),
    mensajeDeExito: `Jugador aprobado`
  })

  const rechazarMutation = useApiMutation({
    fn: async (dto: RechazarJugadorDTO) => {
      await api.rechazarJugador(dto)
    },
    antesDeMensajeExito: () => navigate(-1),
    mensajeDeExito: `Jugador rechazado`
  })

  const equipo = useMemo(() => {
    if (jugador?.equipos)
      return jugador.equipos.find(
        (equipo) => equipo.id === Number(jugadorequipoid)
      )
  }, [jugador, jugadorequipoid])

  return (
    <ContenedorCargandoYError estaCargando={isLoading} hayError={isError}>
      {jugador && (
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
                <Boton
                  variant='default'
                  className='w-full'
                  estaCargando={
                    aprobarMutation.isPending || rechazarMutation.isPending
                  }
                  onClick={() => {
                    aprobarMutation.mutate(
                      new AprobarJugadorDTO({
                        id: jugador!.id,
                        jugadorEquipoId: Number(jugadorequipoid),
                        dni: datosCabecera!.dni,
                        nombre: datosCabecera!.nombre,
                        apellido: datosCabecera!.apellido,
                        fechaNacimiento: datosCabecera!.fechaNacimiento
                      })
                    )
                  }}
                >
                  Aprobar
                </Boton>

                <Boton
                  variant='destructive'
                  className='w-full'
                  estaCargando={
                    aprobarMutation.isPending || rechazarMutation.isPending
                  }
                  onClick={() => {
                    if (!motivoRechazo) {
                      toast.error('Hay que ingresar un motivo de rechazo.')
                      return
                    }

                    rechazarMutation.mutate(
                      new RechazarJugadorDTO({
                        id: jugador!.id,
                        jugadorEquipoId: Number(jugadorequipoid),
                        motivo: motivoRechazo,
                        dni: datosCabecera!.dni,
                        nombre: datosCabecera!.nombre,
                        apellido: datosCabecera!.apellido,
                        fechaNacimiento: datosCabecera!.fechaNacimiento
                      })
                    )
                  }}
                >
                  Rechazar
                </Boton>
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
                defaultValue={equipo?.motivo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
              />
            </div>
          </CardContent>

          <div className='flex justify-end mt-6'>
            <BotonVolver texto='Volver' />
          </div>
        </Card>
      )}
    </ContenedorCargandoYError>
  )
}

export default AprobarRechazarJugador
