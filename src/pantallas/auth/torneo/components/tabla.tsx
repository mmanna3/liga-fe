import { TorneoDTO } from '@/api/clients'
import Tabla from '@/design-system/ykn-ui/tabla'
import { rutasNavegacion } from '@/ruteo/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'

interface ITablaTorneo {
  data: TorneoDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaTorneo({
  data,
  isLoading,
  isError
}: ITablaTorneo) {
  const navigate = useNavigate()

  const columnas: ColumnDef<TorneoDTO>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => <span>{row.getValue('nombre')}</span>
    }
  ]

  return (
    <Tabla<TorneoDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.detalleTorneo}/${row.original.id}`)
      }
    />
  )
}
