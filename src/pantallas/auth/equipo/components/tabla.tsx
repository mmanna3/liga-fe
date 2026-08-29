import { EquipoListadoDTO } from '@/api/clients'
import Tabla from '@/design-system/ykn-ui/tabla'
import { useTablaListaUi } from '@/logica-compartida/hooks/use-tabla-lista-ui'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useEquiposListaUiStore } from '../stores/use-equipos-lista-ui-store'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

interface ITablaEquipo {
  data: EquipoListadoDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaEquipo({
  data,
  isLoading,
  isError
}: ITablaEquipo) {
  const navigate = useNavigate()
  const tablaListaUi = useTablaListaUi(useEquiposListaUiStore)

  const columnas = useMemo<ColumnDef<EquipoListadoDTO>[]>(
    () => [
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
        id: 'torneos',
        header: 'Torneos',
        cell: ({ row }) => {
          const torneos = row.original.torneos ?? []
          return <span>{torneos.length ? torneos.join(', ') : '-'}</span>
        }
      },
      {
        accessorKey: 'codigoAlfanumerico',
        header: 'Código',
        cell: ({ row }) => <span>{row.getValue('codigoAlfanumerico')}</span>
      },
      {
        accessorKey: 'cantidadJugadores',
        header: 'Jugadores',
        cell: ({ row }) => <span>{row.getValue('cantidadJugadores')}</span>
      }
    ],
    []
  )

  return (
    <Tabla<EquipoListadoDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      {...tablaListaUi}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.detalleEquipo}/${row.original.id}`)
      }
    />
  )
}
