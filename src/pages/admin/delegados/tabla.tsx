import { DelegadoDTO } from '@/api/clients'
import { Badge } from '@/components/ui/badge'
import Tabla from '@/components/ykn-ui/tabla'
import { rutasNavegacion } from '@/routes/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'

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
        <Tabla.MenuContextual
          items={[
            {
              texto: 'Editar',
              onClick: () =>
                navigate(
                  `${rutasNavegacion.detalleDelegado}/${row.original.id}`
                )
            },
            {
              texto: 'Blanquear clave',
              onClick: () =>
                navigate(
                  `${rutasNavegacion.blanquearClaveDelegado}/${row.original.id}/${row.original.nombreUsuario}`
                )
            },
            {
              texto: 'Eliminar',
              onClick: () =>
                navigate(
                  `${rutasNavegacion.eliminarDelegado}/${row.original.id}/${row.original.nombreUsuario}`
                )
            }
          ]}
        />
      )
    }
  ]

  return (
    <Tabla<DelegadoDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
    />
  )
}
