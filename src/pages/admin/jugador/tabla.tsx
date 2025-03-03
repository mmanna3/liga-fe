import { api } from '@/api/api'
import { EquipoDelJugadorDTO, JugadorDTO } from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import Tabla from '@/components/ykn-ui/tabla'
import { rutasNavegacion } from '@/routes/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'

export default function TablaJugador() {
  const navigate = useNavigate()

  const { data, isLoading, isError } = useApiQuery({
    key: ['jugadores'],
    fn: async () => await api.jugadorAll()
  })

  const columnas: ColumnDef<JugadorDTO>[] = [
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
      accessorKey: 'equipos',
      header: 'Equipos',
      cell: ({ row }) => (
        <span>{(row.getValue('equipos') as EquipoDelJugadorDTO[]).length}</span>
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
                navigate(`${rutasNavegacion.detalleJugador}/${row.original.id}`)
            }
          ]}
        />
      )
    }
  ]

  return (
    <Tabla<JugadorDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
    />
  )
}
