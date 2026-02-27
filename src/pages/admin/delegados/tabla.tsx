import { DelegadoDTO } from '@/api/clients'
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
      accessorKey: 'nombreUsuario',
      header: 'Usuario',
      cell: ({ row }) => <span>{row.getValue('nombreUsuario')}</span>
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
      accessorKey: 'estadoDelegado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.original.estadoDelegado
        if (!estado) return null
        return (
          <Badge
            className={`px-3 py-1 rounded-md ${estadoBadgeClassDelegado[estado.id!] ?? ''}`}
          >
            {estado.estado}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'blanqueoPendiente',
      header: '',
      cell: ({ row }) => (
        <span>
          {(row.getValue('blanqueoPendiente') as boolean) == true && (
            <Badge className='px-3 py-1 rounded-md bg-blue-700'>
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
                    `${rutasNavegacion.blanquearClaveDelegado}/${row.original.id}/${row.original.nombreUsuario}${search}`
                  )
              },
              {
                texto: 'Eliminar',
                onClick: () =>
                  navigate(
                    `${rutasNavegacion.eliminarDelegado}/${row.original.id}/${row.original.nombreUsuario}${search}`
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
