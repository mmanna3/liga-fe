import { EquipoDelJugadorDTO, JugadorDTO } from '@/api/clients'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import Tabla from '@/components/ykn-ui/tabla'
import { useAuth } from '@/hooks/use-auth'
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
  const esAdmin = useAuth((state) => state.esAdmin)

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
      header: 'Equipo',
      cell: ({ row }) => (
        <span>
          {/* El mapeo de este request deja a todos los jugadores con un array de 1 equipo */}
          {(row.getValue('equipos') as EquipoDelJugadorDTO[]).length > 0
            ? (row.getValue('equipos') as EquipoDelJugadorDTO[])[0].nombre
            : ''}
        </span>
      )
    },
    {
      accessorKey: 'torneo',
      header: 'Torneo',
      cell: ({ row }) => (
        <span>
          {/* El mapeo de este request deja a todos los jugadores con un array de 1 equipo */}
          {(row.getValue('equipos') as EquipoDelJugadorDTO[]).length > 0
            ? (row.getValue('equipos') as EquipoDelJugadorDTO[])[0].torneo
            : ''}
        </span>
      )
    },
    {
      accessorKey: 'equipos',
      header: 'Estado',
      cell: ({ row }) => {
        if ((row.getValue('equipos') as EquipoDelJugadorDTO[]).length === 0) {
          return ''
        }

        const equipo = (row.getValue('equipos') as EquipoDelJugadorDTO[])[0]
        const estado = equipo.estado as unknown as EstadoJugador
        const esPendienteORechazo =
          estado === EstadoJugador.FichajePendienteDeAprobacion ||
          estado === EstadoJugador.FichajeRechazado

        return (
          <div
            className={esPendienteORechazo && esAdmin() ? 'cursor-pointer' : ''}
            onClick={(e) => {
              e.stopPropagation()
              if (esPendienteORechazo && esAdmin()) {
                navigate(
                  `${rutasNavegacion.aprobarRechazarJugador}/${equipo.id}/${row.original.id}`
                )
              }
            }}
          >
            <JugadorEquipoEstadoBadge estado={estado} />
          </div>
        )
      }
    },
    {
      id: 'acciones',
      header: '',
      cell: ({ row }) => {
        const menuItems = [
          {
            texto: 'Detalle',
            onClick: () =>
              navigate(`${rutasNavegacion.detalleJugador}/${row.original.id}`)
          }
        ]

        // Solo agregar el botón de Suspender/Activar si el usuario no es admin
        if (!esAdmin()) {
          const equipo = (row.getValue('equipos') as EquipoDelJugadorDTO[])[0]
          const estado = equipo.estado as unknown as EstadoJugador
          const estaActivoOSuspendido =
            estado === EstadoJugador.Activo ||
            estado === EstadoJugador.Suspendido
          
          if (estaActivoOSuspendido) {
            menuItems.push({
              texto: 'Suspender/Activar',
              onClick: () =>
                navigate(
                  `${rutasNavegacion.suspenderActivar}/${equipo.id}/${row.original.id}`
                )
            })
          }
        }

        // Solo agregar el botón de Eliminar si el usuario es admin
        if (esAdmin()) {
          menuItems.push({
            texto: 'Eliminar',
            onClick: () =>
              navigate(
                `${rutasNavegacion.eliminarJugador}/${row.original.id}/${row.original.dni}`
              )
          })
        }

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Tabla.MenuContextual items={menuItems} />
          </div>
        )
      }
    }
  ]

  return (
    <Tabla<JugadorDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.detalleJugador}/${row.original.id}`)
      }
    />
  )
}
