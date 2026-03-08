import { api } from '@/api/api'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { ContenedorCargandoYError } from '@/components/cargando-y-error-contenedor'
import { Button } from '@/components/ui/button'
import ModalEliminacion from '@/components/modal-eliminacion'
import { VisibleSoloParaAdmin } from '@/components/visible-solo-para-admin'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import LayoutABM from '@/components/ykn-ui/layout-abm'
import { EstadoJugador } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { Calendar, CreditCard } from 'react-feather'
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
        <LayoutABM
          titulo={`${jugador.nombre} ${jugador.apellido}`}
          headerClassName='flex flex-col items-center text-center'
          contenido={
            <>
              <div className='flex justify-center mb-6'>
                <img
                  src={jugador.fotoCarnet}
                  alt={`${jugador.nombre} ${jugador.apellido}`}
                  className='w-32 h-32 rounded-lg object-cover'
                />
              </div>
              <div className='flex flex-col gap-1 bg-gray-50 p-5 rounded-lg mb-6'>
                <DetalleItem
                  icon={<CreditCard className='h-5 w-5' />}
                  valor={jugador.dni!}
                />
                <DetalleItem
                  icon={<Calendar className='h-5 w-5' />}
                  valor={jugador.fechaNacimiento!.toLocaleDateString('es-AR')}
                />
              </div>

              {jugador.delegadoId != null && (
                <div className='mb-4'>
                  <button
                    className='text-blue-600 hover:underline text-sm'
                    onClick={() =>
                      navigate(
                        `${rutasNavegacion.detalleDelegado}/${jugador.delegadoId}`
                      )
                    }
                  >
                    Este jugador es delegado →
                  </button>
                </div>
              )}

              <h2 className='text-lg font-medium mt-6 mb-4 text-gray-700'>
                Equipos
              </h2>
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
                        {
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
                        }
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
              <VisibleSoloParaAdmin>
                <div className='mb-6 flex justify-end'>
                  <ModalEliminacion
                    titulo='Eliminar jugador'
                    subtitulo='Al eliminar el jugador, se lo desvinculará también de todos los equipos.'
                    eliminarOnClick={() => eliminarMutation.mutate(jugador.id!)}
                    eliminarTexto='Eliminar jugador'
                    estaCargando={eliminarMutation.isPending}
                    trigger={
                      <Button variant='destructive'>Eliminar jugador</Button>
                    }
                  />
                </div>
              </VisibleSoloParaAdmin>
            </>
          }
        />
      )}
    </ContenedorCargandoYError>
  )
}
