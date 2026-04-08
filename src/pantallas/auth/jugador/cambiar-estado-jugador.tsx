import { api } from '@/api/api'
import { CambiarEstadoDelJugadorDTO, JugadorDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { ContenedorCargandoYError } from '@/design-system/cargando-y-error-contenedor'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/design-system/base-ui/card'
import { Textarea } from '@/design-system/base-ui/textarea'
import BotonVolver from '@/design-system/ykn-ui/boton-volver'
import DetalleItem from '@/design-system/ykn-ui/detalle-item'
import JugadorEquipoEstadoBadge from '@/design-system/ykn-ui/jugador-equipo-estado-badge'
import {
  estadoTransiciones,
  obtenerNombreEstado
} from '@/logica-compartida/estado-jugador-lib'
import { EstadoJugador } from '@/logica-compartida/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BotonCambiarEstado from './components/boton-cambiar-estado'
import ModalActualizarTarjetas, {
  TarjetasJugadorResumenClickeable
} from './components/modal-actualizar-tarjetas'
import ContenedorBotones from '@/design-system/ykn-ui/contenedor-botones'
import { Boton } from '@/design-system/ykn-ui/boton'
import { rutasNavegacion } from '@/ruteo/rutas'

export default function CambiarEstado() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { jugadorequipoid, jugadorid } = useParams<{
    jugadorequipoid: string
    jugadorid: string
  }>()
  const [estado, setEstado] = useState<EstadoJugador | null>(null)
  const [motivo, setMotivo] = useState('')
  const [modalTarjetasAbierto, setModalTarjetasAbierto] = useState(false)

  const {
    data: jugador,
    isError,
    isLoading
  } = useApiQuery<JugadorDTO>({
    key: ['jugador', jugadorid],
    fn: async () => await api.jugadorGET(Number(jugadorid)),
    activado: true,
    transformarResultado: (jugador) => {
      if (!jugador?.equipos) return jugador

      const equipo = jugador.equipos.find(
        (equipo) => equipo.id === Number(jugadorequipoid)
      )

      if (!equipo) return jugador

      const estadoConvertido = obtenerNombreEstado(equipo.estado!)
      if (estadoConvertido && estado === null) {
        setEstado(estadoConvertido)
        setMotivo(equipo.motivo || '')
      }

      return jugador
    }
  })

  const equipo = useMemo(() => {
    if (jugador?.equipos)
      return jugador.equipos.find(
        (equipo) => equipo.id === Number(jugadorequipoid)
      )
  }, [jugador, jugadorequipoid])

  return (
    <ContenedorCargandoYError hayError={isError} estaCargando={isLoading}>
      <div className='mb-4'>
        <BotonVolver />
      </div>
      <Card className='max-w-lg mx-auto p-6 rounded-xl border bg-white'>
        <CardHeader className='flex flex-col items-center text-center'>
          <img
            src={jugador!.fotoCarnet}
            alt={`${jugador!.nombre} ${jugador!.apellido}`}
            className='w-32 h-32 rounded-lg object-cover'
          />
          <CardTitle className='mt-4 text-3xl font-semibold text-gray-900'>
            {jugador!.nombre} {jugador!.apellido}
          </CardTitle>
          {equipo && (
            <>
              <TarjetasJugadorResumenClickeable
                amarillas={equipo.tarjetasAmarillas ?? 0}
                rojas={equipo.tarjetasRojas ?? 0}
                onClick={() => setModalTarjetasAbierto(true)}
              />
              <ModalActualizarTarjetas
                open={modalTarjetasAbierto}
                onOpenChange={setModalTarjetasAbierto}
                jugadorEquipoId={equipo.id!}
                tarjetasAmarillasInicial={equipo.tarjetasAmarillas ?? 0}
                tarjetasRojasInicial={equipo.tarjetasRojas ?? 0}
                onGuardado={() => {
                  queryClient.invalidateQueries({
                    queryKey: ['jugador', jugadorid]
                  })
                }}
              />
            </>
          )}
        </CardHeader>

        <CardContent>
          <div className='flex flex-col gap-3 bg-gray-50 p-5 rounded-lg mb-6'>
            <DetalleItem icono='Carnet' valor={jugador!.dni!} />
            <DetalleItem
              icono='Calendario'
              valor={jugador!.fechaNacimiento!.toLocaleDateString('es-AR')}
            />
          </div>
          {equipo && (
            <div
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
              </div>
            </div>
          )}

          <div className='mt-8'>
            <Textarea
              placeholder='Escribí el motivo de este cambio de estado...'
              rows={6}
              className='w-full h-28'
              defaultValue={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
          <div className='mt-4 flex gap-2 justify-center'>
            {estadoTransiciones[estado!]?.map(
              ({ label, action, mensajeExito }) => (
                <BotonCambiarEstado
                  key={label}
                  label={label}
                  action={action}
                  mensajeExito={mensajeExito}
                  motivo={motivo}
                  jugador={
                    new CambiarEstadoDelJugadorDTO({
                      jugadorEquipoId: Number(jugadorequipoid),
                      jugadorId: Number(jugadorid)
                    })
                  }
                />
              )
            )}
          </div>
          <div className='mt-12'>
            <ContenedorBotones>
              <Boton
                variant='destructive'
                onClick={() =>
                  navigate(
                    `${rutasNavegacion.desvincularJugadorDelEquipo}/${jugadorid}/${jugador?.dni}/${equipo?.equipoId}/${equipo?.nombre}`
                  )
                }
              >
                Desvincular jugador del equipo
              </Boton>
            </ContenedorBotones>
          </div>
        </CardContent>
      </Card>
    </ContenedorCargandoYError>
  )
}
