import { api } from '@/api/api'
import { DelegadoClubDTO, DelegadoDTO } from '@/api/clients'
import { EstadoDelegadoEnum } from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import Tabla from '@/components/ykn-ui/tabla'
import { estadoBadgeClassDelegado, EstadoDelegado } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { Sliders } from 'react-feather'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

const estadoConfigArray = [
  { key: EstadoDelegado.PendienteDeAprobacion, label: 'Pendiente' },
  { key: EstadoDelegado.Activo, label: 'Activo' }
]

export default function TablaDelegados() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
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

  const search = searchParams.toString() ? `?${searchParams.toString()}` : ''

  const filtro = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          title='Filtrar por estado'
          className='inline-flex items-center justify-center gap-1 rounded-md border border-input bg-background p-2 text-sm hover:bg-accent cursor-pointer'
        >
          <Sliders className='h-4 w-4 shrink-0' />
          {filtroEstados.length > 0 && (
            <span className='bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
              {filtroEstados.length}
            </span>
          )}
        </button>
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

  const columnas: ColumnDef<DelegadoDTO>[] = [
    {
      id: 'nombreUsuario',
      accessorFn: (row) => row.usuario?.nombreUsuario,
      header: 'Usuario',
      cell: ({ row }) => <span>{row.original.usuario?.nombreUsuario}</span>
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => <span>{row.getValue('nombre')}</span>
    },
    {
      accessorKey: 'apellido',
      header: 'Apellido',
      cell: ({ row }) => <span>{row.getValue('apellido')}</span>
    },
    {
      id: 'clubs',
      header: 'Clubs',
      cell: ({ row }) => (
        <span>
          {row.original.delegadoClubs
            ?.map((dc: DelegadoClubDTO) => dc.clubNombre)
            .filter(Boolean)
            .join(', ') ?? ''}
        </span>
      )
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const clubs = row.original.delegadoClubs ?? []
        const estadosUnicos = [
          ...new Map(
            clubs
              .map((dc) => dc.estadoDelegado)
              .filter((e): e is NonNullable<typeof e> => e != null)
              .map((e) => [e.id, e])
          ).values()
        ]
        if (estadosUnicos.length === 0) return null
        return (
          <div className='flex flex-wrap gap-1'>
            {estadosUnicos.map((estado) => (
              <Badge
                key={estado.id}
                className={`px-3 py-1 rounded-md ${estadoBadgeClassDelegado[estado.id!] ?? ''}`}
              >
                {estado.estado}
              </Badge>
            ))}
          </div>
        )
      }
    },
    {
      id: 'esJugador',
      header: () => <span className='whitespace-nowrap'>Es jugador</span>,
      cell: ({ row }) =>
        row.original.jugadorId != null ? (
          <span className='flex justify-center text-green-600 font-bold'>
            ✓
          </span>
        ) : null
    },
    {
      accessorKey: 'blanqueoPendiente',
      header: '',
      cell: ({ row }) => (
        <span>
          {(row.getValue('blanqueoPendiente') as boolean) == true && (
            <Badge className='px-3 py-1 rounded-md border-gray-700 bg-white text-gray-700'>
              Blanqueo pendiente
            </Badge>
          )}
        </span>
      )
    }
  ]

  return (
    <Tabla<DelegadoDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      filtro={filtro}
      onRowClick={(row) =>
        navigate(
          `${rutasNavegacion.detalleDelegado}/${row.original.id}${search}`
        )
      }
    />
  )
}
