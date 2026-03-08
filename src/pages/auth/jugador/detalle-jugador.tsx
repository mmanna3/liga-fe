import { api } from '@/api/api'
import useApiMutation from '@/api/hooks/use-api-mutation'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/components/cargando-y-error-contenedor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ModalEliminacion from '@/components/modal-eliminacion'
import { VisibleSoloParaAdmin } from '@/components/visible-solo-para-admin'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import Link from '@/components/ykn-ui/link'
import { EstadoJugador } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import Icono from '@/components/ykn-ui/icono'
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

  const eliminarMutation = useApiMutation({
    fn: async (jugadorId: number) => {
      await api.jugadorDELETE(jugadorId)
    },
    antesDeMensajeExito: () => navigate(rutasNavegacion.jugadores),
    mensajeDeExito: `El jugador de DNI '${jugador?.dni}' fue eliminado.`
  })

  // Función para formatear la fecha en formato dd-MM-yy
  const formatearFecha = (fecha: string | Date | undefined | null) => {
    if (!fecha) return null

    const date = new Date(fecha)

    // Si la fecha es 01-01-01 (o cualquier fecha cercana al año 1), considerarla como null
    if (date.getFullYear() < 1900) return null

    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  return (
    <ContenedorCargandoYError
      estaCargando={isLoading}
      hayError={isError}
      mensajeDeError='No se pudieron recuperar los datos del jugador'
    >
      {jugador && (
        <div className='max-w-lg mx-auto px-4'>
          <div className='mb-4'>
            <BotonVolver />
          </div>

          {/* Card1: nombre y foto */}
          <Card className='mb-4 p-6 rounded-xl border bg-white shadow-md'>
            <div className='flex flex-col items-center'>
              <h1 className='text-base font-semibold text-gray-900'>
                {jugador.nombre} {jugador.apellido}
              </h1>
              <img
                src={jugador.fotoCarnet}
                alt={`${jugador.nombre} ${jugador.apellido}`}
                className='mt-4 w-40 h-40 rounded-lg object-cover'
              />
              <VisibleSoloParaAdmin>
                <div className='mt-4 flex justify-end w-full'>
                  <ModalEliminacion
                    titulo='Eliminar jugador'
                    subtitulo='Al eliminar el jugador, se lo desvinculará también de todos los equipos.'
                    eliminarOnClick={() => eliminarMutation.mutate(jugador.id!)}
                    eliminarTexto='Eliminar jugador'
                    estaCargando={eliminarMutation.isPending}
                    trigger={
                      <Button
                        variant='outline'
                        size='icon'
                        className='h-10 w-10 border-destructive text-destructive hover:bg-destructive/10'
                      >
                        <Icono nombre='Eliminar' className='h-5 w-5' />
                      </Button>
                    }
                  />
                </div>
              </VisibleSoloParaAdmin>
            </div>
          </Card>

          {/* Card2: datos */}
          <Card className='mb-4 p-6 rounded-xl border bg-white shadow-md'>
            <CardContent>
              <div className='flex flex-col gap-1'>
                <DetalleItem
                  icon={<Icono nombre='Carnet' className='h-5 w-5' />}
                  valor={jugador.dni!}
                />
                <DetalleItem
                  icon={<Icono nombre='Calendario' className='h-5 w-5' />}
                  valor={jugador.fechaNacimiento!.toLocaleDateString('es-AR')}
                />
              </div>
              {jugador.delegadoId != null && (
                <div className='mt-4'>
                  <Link
                    to={`${rutasNavegacion.detalleDelegado}/${jugador.delegadoId}`}
                  >
                    Este jugador es delegado →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card3: equipos */}
          <Card className='mb-4 p-6 rounded-xl border bg-white shadow-md'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-xl font-semibold'>Equipos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className='divide-y divide-gray-200'>
                {jugador.equipos!.map((equipo) => (
                  <li key={equipo.id} className='py-3 flex flex-col'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <span className='text-lg font-medium text-gray-900'>
                          {equipo.nombre}
                        </span>
                        <div className='text-sm text-gray-600'>
                          {equipo.torneo}
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        <JugadorEquipoEstadoBadge
                          estado={Number(equipo.estado)}
                        />
                        <VisibleSoloParaAdmin>
                          <Button
                            variant='ghost'
                            className='text-blue-600'
                            onClick={() => {
                              if (
                                Number(equipo.estado) ===
                                  EstadoJugador.FichajePendienteDeAprobacion ||
                                Number(equipo.estado) ===
                                  EstadoJugador.FichajeRechazado
                              )
                                navigate(
                                  `${rutasNavegacion.aprobarRechazarJugador}/${equipo.id}/${jugador.id}`
                                )
                              else
                                navigate(
                                  `${rutasNavegacion.cambiarEstadoJugador}/${equipo.id}/${jugador.id}`
                                )
                            }}
                          >
                            Gestionar
                          </Button>
                        </VisibleSoloParaAdmin>
                      </div>
                    </div>
                    <div className='text-sm text-gray-400 mt-1'>
                      {equipo.fechaPagoDeFichaje
                        ? `Pago de fichaje: ${formatearFecha(equipo.fechaPagoDeFichaje)}`
                        : 'Fichaje impago'}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </ContenedorCargandoYError>
  )
}
