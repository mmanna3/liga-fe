import { api } from '@/api/api'
import { InhabilitarJugadorDTO } from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { ContenedorCargandoYError } from '@/components/cargando-y-error-contenedor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import {
  estadoTransiciones,
  obtenerEstado,
  obtenerNombreEstado
} from '@/lib/estado-jugador-lib'
import { EstadoJugador } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import BotonCambiarEstado from './components/boton-cambiar-estado'

export default function CambiarEstado() {
  const { jugadorequipoid, jugadorid } = useParams<{
    jugadorequipoid: string
    jugadorid: string
  }>()
  const [estado, setEstado] = useState<EstadoJugador | null>(null)

  const {
    data: jugador,
    isError,
    isLoading
  } = useApiQuery({
    key: ['jugador', jugadorid],
    fn: async () => await api.jugadorGET(Number(jugadorid)),
    onResultadoExitoso: async () => {
      if (jugador && jugador.equipos)
        setEstado(obtenerEstado(jugador.equipos!, Number(jugadorequipoid)))
    },
    activado: estado == null
  })

  useEffect(() => {
    let equipo
    if (jugador?.equipos) {
      equipo = jugador.equipos.find(
        (equipo) => equipo.id === Number(jugadorequipoid)
      )
      if (equipo) {
        const estadoConvertido = obtenerNombreEstado(equipo.estado!)
        console.log('el estado convertido es', estadoConvertido)
        if (estadoConvertido) {
          setEstado(estadoConvertido)
        }
      }
    }
  }, [jugador, jugadorequipoid])

  const equipo = useMemo(() => {
    if (jugador?.equipos)
      return jugador.equipos.find(
        (equipo) => equipo.id === Number(jugadorequipoid)
      )
  }, [jugador, jugadorequipoid])

  return (
    <ContenedorCargandoYError hayError={isError} estaCargando={isLoading}>
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
          <div className='mt-16 flex gap-2 justify-center'>
            {estadoTransiciones[estado!]?.map(
              ({ label, action, mensajeExito }) => (
                <BotonCambiarEstado
                  key={label}
                  label={label}
                  action={action}
                  mensajeExito={mensajeExito}
                  jugador={
                    new InhabilitarJugadorDTO({
                      // si esto anda renombra lo del back
                      jugadorEquipoId: Number(jugadorequipoid),
                      jugadorId: Number(jugadorid),
                      motivo: ''
                    })
                  }
                />
              )
            )}
          </div>
        </CardContent>
      </Card>
    </ContenedorCargandoYError>
  )
}
