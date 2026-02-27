import { EquipoDTO, JugadorDelEquipoDTO } from '@/api/clients'
import Tabla from '@/components/ykn-ui/tabla'
import { useAuth } from '@/hooks/use-auth'
import { rutasNavegacion } from '@/routes/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'

interface ITablaEquipo {
  data: EquipoDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaEquipo({
  data,
  isLoading,
  isError
}: ITablaEquipo) {
  const navigate = useNavigate()
  const esAdmin = useAuth((state) => state.esAdmin)

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
      accessorKey: 'torneoNombre',
      header: 'Torneo',
      cell: ({ row }) => <span>{row.getValue('torneoNombre') || '-'}</span>
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
      cell: ({ row }) => {
        const menuItems = [
          {
            texto: 'Detalle',
            onClick: () =>
              navigate(`${rutasNavegacion.detalleEquipo}/${row.original.id}`)
          }
        ]

        // Solo agregar el botón de Editar si el usuario es admin
        if (esAdmin()) {
          menuItems.push({
            texto: 'Editar',
            onClick: () =>
              navigate(`${rutasNavegacion.editarEquipo}/${row.original.id}`)
          })

          menuItems.push({
            texto: 'Cambio estado masivo',
            onClick: () =>
              navigate(
                `${rutasNavegacion.cambioEstadoMasivoEquipo}/${row.original.id}`
              )
          })

          menuItems.push({
            texto: 'Pases',
            onClick: () =>
              navigate(
                `${rutasNavegacion.pases}/${row.original.id}`
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
    <Tabla<EquipoDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.detalleEquipo}/${row.original.id}`)
      }
    />
  )
}
