import { ArbitroDTO } from '@/api/clients'
import Tabla from '@/design-system/ykn-ui/tabla'
import { useTablaListaUi } from '@/logica-compartida/hooks/use-tabla-lista-ui'
import { useArbitrosListaUiStore } from '../stores/use-arbitros-lista-ui-store'
import { ColumnDef } from '@tanstack/react-table'

interface ITablaArbitros {
  data: ArbitroDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaArbitros({
  data,
  isLoading,
  isError
}: ITablaArbitros) {
  const tablaListaUi = useTablaListaUi(useArbitrosListaUiStore)

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
    }
  ]

  return (
    <Tabla<ArbitroDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      {...tablaListaUi}
    />
  )
}
