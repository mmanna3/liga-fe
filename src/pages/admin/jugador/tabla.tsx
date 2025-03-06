import { EquipoDelJugadorDTO, JugadorDTO } from '@/api/clients'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import Tabla from '@/components/ykn-ui/tabla'
import { EstadoJugador } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'

interface ITablaJugador {
  data: JugadorDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaJugador({
  data,
  isLoading,
  isError
}: ITablaJugador) {
  const navigate = useNavigate()

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
      header: 'Estado',
      cell: ({ row }) => (
        <span>
          {/* Cuando los jugadores tengan más de un equipo, esto no va a funcionar bien */}
          {(row.getValue('equipos') as EquipoDelJugadorDTO[]).length > 0 ? (
            <JugadorEquipoEstadoBadge
              estado={
                (row.getValue('equipos') as EquipoDelJugadorDTO[])[0]
                  .estado as unknown as EstadoJugador
              }
            />
          ) : (
            ''
          )}
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
