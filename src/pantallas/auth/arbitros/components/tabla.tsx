import { ArbitroDTO } from '@/api/clients'
import Tabla from '@/design-system/ykn-ui/tabla'
import { useTablaListaUi } from '@/logica-compartida/hooks/use-tabla-lista-ui'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useArbitrosListaUiStore } from '../stores/use-arbitros-lista-ui-store'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
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
    },
    {
      id: 'agrupadores',
      header: 'Agrupadores',
      cell: ({ row }) => {
        const nombres =
          row.original.torneoAgrupadores
            ?.map((a) => a.torneoAgrupadorNombre)
            .filter(Boolean) ?? []
        return <span>{nombres.length > 0 ? nombres.join(', ') : '—'}</span>
      }
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
        navigate(`${rutasNavegacion.editarArbitro}/${row.original.id}`)
      }
    />
  )
}
