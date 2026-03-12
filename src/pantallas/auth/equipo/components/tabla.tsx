import { EquipoDTO, JugadorDelEquipoDTO } from '@/api/clients'
import Tabla from '@/design-system/ykn-ui/tabla'
import { rutasNavegacion } from '@/ruteo/rutas'
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
      id: 'torneoExcluyente',
      header: 'Torneo excluyente',
      cell: ({ row }) => {
        const z = row.original.zonaExcluyente
        if (!z) return <span>-</span>
        const partes = [z.torneo, z.fase, z.nombre].filter(Boolean)
        return <span>{partes.join(' · ') || '-'}</span>
      }
    },
    {
      id: 'otrosTorneos',
      header: 'Otros torneos',
      cell: ({ row }) => {
        const zonas = row.original.zonasNoExcluyentes ?? []
        const torneos = [...new Set(zonas.map((z) => z.torneo).filter(Boolean))]
        return <span>{torneos.length ? torneos.join(', ') : '-'}</span>
      }
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
