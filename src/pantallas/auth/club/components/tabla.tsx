import { ClubListadoDTO } from '@/api/clients'
import Tabla from '@/design-system/ykn-ui/tabla'
import { useTablaListaUi } from '@/logica-compartida/hooks/use-tabla-lista-ui'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useClubesListaUiStore } from '../stores/use-clubes-lista-ui-store'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { tituloCanchaTipoPorId } from '../opciones-cancha-tipo'

interface ITablaClub {
  data: ClubListadoDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaClub({ data, isLoading, isError }: ITablaClub) {
  const navigate = useNavigate()
  const tablaListaUi = useTablaListaUi(useClubesListaUiStore)

  const columnas = useMemo<ColumnDef<ClubListadoDTO>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: ({ row }) => <span>{row.getValue('nombre')}</span>
      },
      {
        accessorKey: 'localidad',
        header: 'Localidad',
        cell: ({ row }) => <span>{row.original.localidad?.trim() || '—'}</span>
      },
      {
        accessorKey: 'canchaTipo',
        header: 'Cancha',
        cell: ({ row }) => (
          <span>
            {row.original.canchaTipo?.trim() ||
              tituloCanchaTipoPorId(row.original.canchaTipoId)}
          </span>
        )
      }
    ],
    []
  )

  return (
    <Tabla<ClubListadoDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      {...tablaListaUi}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.detalleClub}/${row.original.id}`)
      }
    />
  )
}
