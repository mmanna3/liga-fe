import { api } from '@/api/api'
import { EstadoDelegadoEnum } from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import FlujoHomeLayout from '@/components/ykn-ui/flujo-home-layout'
import { EstadoDelegado } from '@/lib/utils'
import { Download, Filter } from 'react-feather'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import ModalSeleccionDelegados from './components/modal-seleccion-delegados'
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
  const [modalSeleccionOpen, setModalSeleccionOpen] = useState(false)

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

  const FilterConPopover = ({ className }: { className?: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <span
          className={className}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Filter className='h-5 w-5 shrink-0' />
          {filtroEstados.length > 0 && (
            <span className='bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
              {filtroEstados.length}
            </span>
          )}
        </span>
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
  )

  return (
    <>
      <FlujoHomeLayout
        titulo='Delegados'
        ocultarBotonVolver
        botonera={{
          iconos: [
            {
              alApretar: () => setModalSeleccionOpen(true),
              tooltip: 'Generar carnets PDF',
              icono: Download
            },
            {
              alApretar: () => {},
              tooltip: 'Filtrar por estado',
              icono: FilterConPopover
            }
          ]
        }}
        contenido={
          <Tabla data={data || []} isLoading={isLoading} isError={isError} />
        }
      />
      <ModalSeleccionDelegados
        open={modalSeleccionOpen}
        onOpenChange={setModalSeleccionOpen}
      />
    </>
  )
}
