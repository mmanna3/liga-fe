import { api } from '@/api/api'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import { EstadoJugador } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

const estadoTransiciones: Record<number, { label: string; action: string }[]> =
  {
    [EstadoJugador.AprobadoPendienteDePago]: [
      { label: 'Pagar fichaje', action: 'PagarFichaje' }
    ],
    [EstadoJugador.Activo]: [
      { label: 'Suspender', action: 'Suspender' },
      { label: 'Inhabilitar', action: 'Inhabilitar' }
    ],
    [EstadoJugador.Suspendido]: [
      { label: 'Activar', action: 'Activar' },
      { label: 'Inhabilitar', action: 'Inhabilitar' }
    ],
    [EstadoJugador.Inhabilitado]: [
      { label: 'Activar', action: 'Activar' },
      { label: 'Suspender', action: 'Suspender' }
    ]
  }

const obtenerNombreEstado = (valor: number): EstadoJugador | undefined => {
  return Object.values(EstadoJugador).includes(valor)
    ? (valor as EstadoJugador)
    : undefined
}

export default function CambiarEstado() {
  const { jugadorequipoid, jugadorid } = useParams<{
    jugadorequipoid: string
    jugadorid: string
  }>()
  const [estado, setEstado] = useState<EstadoJugador | null>(null)

  const [mensaje, setMensaje] = useState<{
    tipo: 'success' | 'error'
    texto: string
  } | null>(null)

  const {
    data: jugador,
    isError,
    isLoading
  } = useApiQuery({
    key: ['jugador', jugadorid],
    fn: async () => await api.jugadorGET(Number(jugadorid)),
    onResultadoExitoso: async () => setEstado(conseguirEstado()),
    activado: estado == null
  })

  const conseguirEstado = () => {
    let equipo
    if (jugador?.equipos) {
      equipo = jugador.equipos.find(
        (equipo) => equipo.id === Number(jugadorequipoid)
      )
      if (equipo) {
        const estadoConvertido = obtenerNombreEstado(equipo.estado!)
        console.log('el estado convertido es', estadoConvertido)
        if (estadoConvertido) {
          return estadoConvertido
        }
      }
    }

    return null
  }

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

  const cambiarEstado = async (action: string) => {
    try {
      // await api[action](jugador.id)
      // setEstado(action)
      setMensaje({ tipo: 'success', texto: `Estado cambiado a ${action}` })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al cambiar estado' })
      console.log(error)
    }
  }

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
          {estadoTransiciones[estado!]?.map(({ label, action }) => (
            <Button key={action} onClick={() => cambiarEstado(action)}>
              {label}
            </Button>
          ))}
        </div>
      </CardContent>

      {mensaje && (
        <Alert
          variant={mensaje.tipo === 'success' ? 'default' : 'destructive'}
          className='mt-4'
        >
          <AlertTitle>
            {mensaje.tipo === 'success' ? 'Éxito' : 'Error'}
          </AlertTitle>
          <AlertDescription>{mensaje.texto}</AlertDescription>
        </Alert>
      )}
    </Card>
  )
}
