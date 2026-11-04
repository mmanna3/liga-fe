import { ArbitroDTO } from '@/api/clients'
import Tabla from '@/design-system/ykn-ui/tabla'
import { useTablaListaUi } from '@/logica-compartida/hooks/use-tabla-lista-ui'
import { rutasNavegacion } from '@/ruteo/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { useArbitrosPendientesListaUiStore } from '../stores/use-arbitros-pendientes-lista-ui-store'

interface ITablaArbitrosPendientes {
  data: ArbitroDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaArbitrosPendientes({
  data,
  isLoading,
  isError
}: ITablaArbitrosPendientes) {
  const navigate = useNavigate()
  const tablaListaUi = useTablaListaUi(useArbitrosPendientesListaUiStore)

  const columnas: ColumnDef<ArbitroDTO>[] = [
    {
      accessorKey: 'dni',
      header: 'DNI',
      cell: ({ row }) => <span>{row.getValue('dni')}</span>
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
      accessorKey: 'telefonoCelular',
      header: 'Teléfono celular',
      cell: ({ row }) => (
        <span>{row.original.telefonoCelular?.trim() || '—'}</span>
      )
    },
    {
      accessorKey: 'localidad',
      header: 'Localidad',
      cell: ({ row }) => <span>{row.original.localidad?.trim() || '—'}</span>
    }
  ]

  return (
    <Tabla<ArbitroDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      {...tablaListaUi}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.aprobarRechazarArbitro}/${row.original.id}`)
      }
    />
  )
}
