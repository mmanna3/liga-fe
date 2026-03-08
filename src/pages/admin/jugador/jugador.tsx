import { api } from '@/api/api'
import { EstadoJugadorEnum } from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import { EstadoJugador } from '@/lib/utils'
import { FilterIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Tabla from './tabla'

const estadoConfigArray = [
  {
    key: EstadoJugador.FichajePendienteDeAprobacion,
    label: 'Pendiente de aprobación'
  },
  { key: EstadoJugador.FichajeRechazado, label: 'Fichaje rechazado' },
  {
    key: EstadoJugador.AprobadoPendienteDePago,
    label: 'Aprobado pendiente de pago'
  },
  { key: EstadoJugador.Activo, label: 'Activo' },
  { key: EstadoJugador.Suspendido, label: 'Suspendido' },
  { key: EstadoJugador.Inhabilitado, label: 'Inhabilitado' }
]

export default function Jugador() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [filtroEstados, setFiltroEstados] = useState<EstadoJugador[]>([])

  useEffect(() => {
    const filtrosParam = searchParams.get('filtros')
    if (filtrosParam) {
      const estadosFromUrl = filtrosParam
        .split(',')
        .map(Number) as EstadoJugador[]
      setFiltroEstados(estadosFromUrl)
    }
  }, [searchParams])

  // Actualizar URL cuando cambian los filtros
  const toggleFiltro = (estado: EstadoJugador) => {
    const nuevosEstados = filtroEstados.includes(estado)
      ? filtroEstados.filter((e) => e !== estado)
      : [...filtroEstados, estado]

    setFiltroEstados(nuevosEstados)

    const newSearchParams = new URLSearchParams(searchParams)
    if (nuevosEstados.length > 0) {
      newSearchParams.set('filtros', nuevosEstados.join(','))
    } else {
      newSearchParams.delete('filtros')
    }

    navigate({
      pathname: location.pathname,
      search: newSearchParams.toString()
    })
  }

  const { data, isLoading, isError } = useApiQuery({
    key: ['jugadores', filtroEstados.toString()],
    fn: async () =>
      await api.listarConFiltro(filtroEstados as unknown as EstadoJugadorEnum[])
  })

  const FilterIconConPopover = ({ className }: { className?: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <span
          className={className}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <FilterIcon className='h-5 w-5 shrink-0' />
          {filtroEstados.length > 0 && (
            <span className='bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
              {filtroEstados.length}
            </span>
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent className='w-60 flex flex-col gap-1'>
        {estadoConfigArray.map(({ key }) => (
          <div
            key={key}
            className={`cursor-pointer flex items-center gap-2 p-2 rounded-md ${
              filtroEstados.includes(key) ? 'bg-blue-100' : ''
            }`}
            onClick={() => toggleFiltro(key)}
          >
            <JugadorEquipoEstadoBadge estado={key} />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )

  return (
    <FlujoHomeLayout
      titulo='Jugadores'
      ocultarBotonVolver
      botonera={{
        iconos: [
          {
            alApretar: () => {},
            tooltip: 'Filtrar por estado',
            icono: FilterIconConPopover
          }
        ]
      }}
      contenido={
        <Tabla data={data || []} isLoading={isLoading} isError={isError} />
      }
    />
  )
}
