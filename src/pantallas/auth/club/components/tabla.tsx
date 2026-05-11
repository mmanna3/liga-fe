import { ClubDTO } from '@/api/clients'
import Tabla from '@/design-system/ykn-ui/tabla'
import { rutasNavegacion } from '@/ruteo/rutas'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { tituloCanchaTipoPorId } from '../opciones-cancha-tipo'
import { tituloCanchaSuperficiePorId } from '../opciones-superficie-tipo'

interface ITablaClub {
  data: ClubDTO[]
  isLoading: boolean
  isError: boolean
}

export default function TablaClub({ data, isLoading, isError }: ITablaClub) {
  const navigate = useNavigate()

  const columnas: ColumnDef<ClubDTO>[] = [
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
    },
    {
      accessorKey: 'canchaSuperficie',
      header: 'Superficie',
      cell: ({ row }) => (
        <span>
          {tituloCanchaSuperficiePorId(row.original.canchaSuperficieId)}
        </span>
      )
    }
  ]

  return (
    <Tabla<ClubDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.detalleClub}/${row.original.id}`)
      }
    />
  )
}
