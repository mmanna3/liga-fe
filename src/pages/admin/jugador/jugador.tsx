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
import { useState } from 'react'
import Tabla from './tabla'

// Cambiamos a un array de objetos para preservar el orden
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
  const [filtroEstados, setFiltroEstados] = useState<EstadoJugador[]>([])

  const toggleFiltro = (estado: EstadoJugador) => {
    setFiltroEstados((prev) =>
      prev.includes(estado)
        ? prev.filter((e) => e !== estado)
        : [...prev, estado]
    )
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
