import { TorneoAgrupadorDTO } from '@/api/clients'
import Tabla from '@/design-system/ykn-ui/tabla'
import { rutasNavegacion } from '@/ruteo/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'

interface ITablaAgrupadorTorneo {
  data: TorneoAgrupadorDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaAgrupadorTorneo({
  data,
  isLoading,
  isError
}: ITablaAgrupadorTorneo) {
  const navigate = useNavigate()

  const columnas: ColumnDef<TorneoAgrupadorDTO>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => <span>{row.getValue('nombre')}</span>
    },
    {
      accessorKey: 'visibleEnApp',
      header: 'Visible en app',
      cell: ({ row }) => <span>{row.original.visibleEnApp ? 'Sí' : 'No'}</span>
    },
    {
      accessorKey: 'cantidadDeTorneos',
      header: 'Torneos',
      cell: ({ row }) => <span>{row.original.cantidadDeTorneos ?? 0}</span>
    }
  ]

  return (
    <Tabla<TorneoAgrupadorDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.editarAgrupadorTorneo}/${row.original.id}`)
      }
    />
  )
}
