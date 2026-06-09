import { UsuarioAdminDTO } from '@/api/clients'
import { Badge } from '@/design-system/base-ui/badge'
import Tabla from '@/design-system/ykn-ui/tabla'
import { useTablaListaUi } from '@/logica-compartida/hooks/use-tabla-lista-ui'
import { rutasNavegacion } from '@/ruteo/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { useUsuariosListaUiStore } from '../stores/use-usuarios-lista-ui-store'

interface TablaUsuariosProps {
  data: UsuarioAdminDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaUsuarios({
  data,
  isLoading,
  isError
}: TablaUsuariosProps) {
  const navigate = useNavigate()
  const tablaListaUi = useTablaListaUi(useUsuariosListaUiStore)

  const columnas: ColumnDef<UsuarioAdminDTO>[] = [
    {
      accessorKey: 'nombreUsuario',
      header: 'Usuario',
      cell: ({ row }) => <span>{row.getValue('nombreUsuario')}</span>
    },
    {
      accessorKey: 'rolNombre',
      header: 'Rol',
      cell: ({ row }) => <span>{row.getValue('rolNombre')}</span>
    },
    {
      accessorKey: 'blanqueoPendiente',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.blanqueoPendiente ? (
          <Badge variant='outline'>Blanqueo pendiente</Badge>
        ) : (
          <span className='text-muted-foreground'>Activo</span>
        )
    }
  ]

  return (
    <Tabla<UsuarioAdminDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      {...tablaListaUi}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.detalleUsuario}/${row.original.id}`)
      }
    />
  )
}
