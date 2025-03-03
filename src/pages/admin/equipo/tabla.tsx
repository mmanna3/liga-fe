import { api } from '@/api/api'
import { EquipoDTO, JugadorDelEquipoDTO } from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import Tabla from '@/components/ykn-ui/tabla'
import { rutasNavegacion } from '@/routes/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'

export default function TablaEquipo() {
  const { data, isLoading, isError } = useApiQuery({
    key: ['equipos'],
    fn: async () => await api.equipoAll()
  })

  const navigate = useNavigate()

  const columnas: ColumnDef<EquipoDTO>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => <span>{row.getValue('nombre')}</span>
    },
    {
      accessorKey: 'clubNombre',
      header: 'Club',
      cell: ({ row }) => <span>{row.getValue('clubNombre')}</span>
    },
    {
      accessorKey: 'codigoAlfanumerico',
      header: 'Código',
      cell: ({ row }) => <span>{row.getValue('codigoAlfanumerico')}</span>
    },
    {
      accessorKey: 'jugadores',
      header: 'Jugadores',
      cell: ({ row }) => (
        <span>
          {(row.getValue('jugadores') as JugadorDelEquipoDTO[]).length}
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
              texto: 'Detalle',
              onClick: () =>
                navigate(`${rutasNavegacion.detalleEquipo}/${row.original.id}`)
            }
          ]}
        />
      )
    }
  ]

  return (
    <Tabla<EquipoDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
    />
  )
}
