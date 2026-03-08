import { ClubDTO } from '@/api/clients'
import Tabla from '@/ui/ykn-ui/tabla'
import { rutasNavegacion } from '@/routes/rutas'
import { ColumnDef } from '@tanstack/react-table'
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
