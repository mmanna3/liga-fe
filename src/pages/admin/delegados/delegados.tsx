import { api } from '@/api/api'
import { EstadoDelegadoEnum } from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import Titulo from '@/components/ykn-ui/titulo'
import { EstadoDelegado } from '@/lib/utils'
import { FilterIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Tabla from './tabla'

const estadoConfigArray = [
  { key: EstadoDelegado.PendienteDeAprobacion, label: 'Pendiente' },
  { key: EstadoDelegado.Activo, label: 'Activo' }
]

export default function Delegados() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [filtroEstados, setFiltroEstados] = useState<EstadoDelegado[]>([])

  useEffect(() => {
    const filtrosParam = searchParams.get('filtros')
    if (filtrosParam) {
      const estadosFromUrl = filtrosParam
        .split(',')
        .map(Number) as EstadoDelegado[]
      setFiltroEstados(estadosFromUrl)
    } else {
      setFiltroEstados([])
    }
  }, [searchParams])

  const toggleFiltro = (estado: EstadoDelegado) => {
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
    key: ['delegados', filtroEstados.toString()],
    fn: async () =>
      await api.listarDelegadosConFiltro(
        filtroEstados.length > 0
          ? (filtroEstados as unknown as EstadoDelegadoEnum[])
          : undefined
      ),
    refetchInterval: 60_000
  })

  return (
    <>
      <Titulo>Delegados</Titulo>
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
          <PopoverContent className='w-48 flex flex-col gap-1'>
            {estadoConfigArray.map(({ key, label }) => (
              <div
                key={key}
                className={`cursor-pointer flex items-center gap-2 p-2 rounded-md ${
                  filtroEstados.includes(key) ? 'bg-blue-100' : ''
                }`}
                onClick={() => toggleFiltro(key)}
              >
                <span className='text-sm'>{label}</span>
              </div>
            ))}
          </PopoverContent>
        </Popover>
      </div>
      <Tabla data={data || []} isLoading={isLoading} isError={isError} />
    </>
  )
}
