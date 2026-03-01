import { DelegadoClubDTO, DelegadoDTO } from '@/api/clients'
import { Badge } from '@/components/ui/badge'
import { VisibleSoloParaAdmin } from '@/components/visible-solo-para-admin'
import Tabla from '@/components/ykn-ui/tabla'
import { estadoBadgeClassDelegado } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface ITablaDelegados {
  data: DelegadoDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaDelegados({
  data,
  isLoading,
  isError
}: ITablaDelegados) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
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
      header: 'Es jugador',
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
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <VisibleSoloParaAdmin>
          <div onClick={(e) => e.stopPropagation()}>
            <Tabla.MenuContextual
              items={[
                {
                  texto: 'Detalle',
                  onClick: () =>
                    navigate(
                      `${rutasNavegacion.detalleDelegado}/${row.original.id}${search}`
                    )
                },
                {
                  texto: 'Blanquear clave',
                  onClick: () =>
                    navigate(
                      `${rutasNavegacion.blanquearClaveDelegado}/${row.original.id}/${row.original.usuario?.nombreUsuario ?? ''}${search}`
                    )
                },
                {
                  texto: 'Eliminar',
                  onClick: () =>
                    navigate(
                      `${rutasNavegacion.eliminarDelegado}/${row.original.id}/${row.original.usuario?.nombreUsuario ?? ''}${search}`
                    )
                }
              ]}
            />
          </div>
        </VisibleSoloParaAdmin>
      )
    }
  ]

  return (
    <Tabla<DelegadoDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      onRowClick={(row) =>
        navigate(
          `${rutasNavegacion.detalleDelegado}/${row.original.id}${search}`
        )
      }
    />
  )
}
