import { api } from '@/api/api'
import { EstadoJugadorEnum } from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import Titulo from '@/components/ykn-ui/titulo'
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

  return (
    <>
      <Titulo>Jugadores</Titulo>
      <div className='mb-4 flex justify-end'>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline'>
              <FilterIcon className='w-4 h-4 mr-1' />
              Filtrar por estado
              {filtroEstados.length > 0 && (
                <span className='ml-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
                  {filtroEstados.length}
                </span>
              )}
            </Button>
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
      </div>
      <Tabla data={data || []} isLoading={isLoading} isError={isError} />
    </>
  )
}
