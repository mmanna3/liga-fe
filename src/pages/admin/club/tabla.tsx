import { ClubDTO } from '@/api/clients'
import Tabla from '@/components/ykn-ui/tabla'
import { rutasNavegacion } from '@/routes/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ITablaClub {
  data: ClubDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaClub({ data, isLoading, isError }: ITablaClub) {
  const navigate = useNavigate()

  const columnas: ColumnDef<ClubDTO>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => <span>{row.getValue('nombre')}</span>
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Tabla.MenuContextual
            items={[
              {
                texto: 'Detalle',
                onClick: () =>
                  navigate(`${rutasNavegacion.detalleClub}/${row.original.id}`)
              },
              {
                texto: 'Editar',
                icon: <Pencil className='h-4 w-4' />,
                onClick: () =>
                  navigate(`${rutasNavegacion.editarClub}/${row.original.id}`)
              }
            ]}
          />
        </div>
      )
    }
  ]

  return (
    <Tabla<ClubDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.detalleClub}/${row.original.id}`)
      }
    />
  )
}
