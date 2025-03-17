import { DelegadoDTO } from '@/api/clients'
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
