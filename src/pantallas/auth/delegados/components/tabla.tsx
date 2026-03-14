import { api } from '@/api/api'
import { DelegadoClubDTO, DelegadoDTO } from '@/api/clients'
import { EstadoDelegadoEnum } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { Badge } from '@/design-system/base-ui/badge'
import Filtro from './filtro'
import Tabla from '@/design-system/ykn-ui/tabla'
import {
  estadoBadgeClassDelegado,
  EstadoDelegado
} from '@/logica-compartida/utils'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useUrlFiltroEstados } from '@/hooks/use-url-filtro-estados'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate, useSearchParams } from 'react-router-dom'

const estadoConfigArray = [
  { key: EstadoDelegado.PendienteDeAprobacion, label: 'Pendiente' },
  { key: EstadoDelegado.Activo, label: 'Activo' }
]

export default function TablaDelegados() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { filtroEstados, toggleFiltro } = useUrlFiltroEstados<EstadoDelegado>()

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
      filtro={
        <Filtro
          filtroEstados={filtroEstados}
          onToggle={toggleFiltro}
          opciones={estadoConfigArray}
        />
      }
      onRowClick={(row) =>
        navigate(
          `${rutasNavegacion.detalleDelegado}/${row.original.id}${search}`
        )
      }
    />
  )
}
