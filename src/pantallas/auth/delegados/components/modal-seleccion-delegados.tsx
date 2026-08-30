import { api } from '@/api/api'
import { DelegadoClubResumenDTO, DelegadoListadoDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { Checkbox } from '@/design-system/base-ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { Boton } from '@/design-system/ykn-ui/boton'
import Tabla from '@/design-system/ykn-ui/tabla'
import { estadoBadgeClassDelegado } from '@/logica-compartida/utils'
import { ColumnDef, Row, RowSelectionState } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { generarCarnetsDelegadosPDF } from './generar-carnets-delegados-pdf'

interface ModalSeleccionDelegadosProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ModalSeleccionDelegados({
  open,
  onOpenChange
}: ModalSeleccionDelegadosProps) {
  const { data: delegados = [], isLoading } = useApiQuery<DelegadoListadoDTO[]>(
    {
      key: ['delegados-seleccion', open ? 'open' : 'closed'],
      fn: () => api.delegadosListado(undefined),
      activado: open
    }
  )
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [selectedDelegados, setSelectedDelegados] = useState<
    DelegadoListadoDTO[]
  >([])
  const [generandoPDF, setGenerandoPDF] = useState(false)

  useEffect(() => {
    if (!delegados?.length) return
    const selected = Object.keys(rowSelection)
      .filter((key) => (rowSelection as Record<string, boolean>)[key])
      .map((key) => delegados[parseInt(key, 10)])
      .filter((d): d is DelegadoListadoDTO => d != null)
    setSelectedDelegados(selected)
  }, [rowSelection, delegados])

  const handleGenerarPDF = async () => {
    if (selectedDelegados.length === 0) return
    setGenerandoPDF(true)
    try {
      // Obtener datos completos (con fotoCarnet) de cada delegado seleccionado
      const ids = selectedDelegados
        .filter((d) => d.id != null)
        .map((d) => d.id!)
      const delegadosCompletos = await api.delegadosPorIds(ids)
      await generarCarnetsDelegadosPDF([...delegadosCompletos])
      onOpenChange(false)
    } finally {
      setGenerandoPDF(false)
    }
  }

  const columnas: ColumnDef<DelegadoListadoDTO>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }: { row: Row<DelegadoListadoDTO> }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      )
    },
    {
      id: 'nombreUsuario',
      accessorFn: (row) => row.nombreUsuario,
      header: 'Usuario',
      cell: ({ row }) => <span>{row.original.nombreUsuario ?? ''}</span>
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre'
    },
    {
      accessorKey: 'apellido',
      header: 'Apellido'
    },
    {
      id: 'clubs',
      accessorFn: (row) =>
        row.clubs
          ?.map((dc: DelegadoClubResumenDTO) => dc.clubNombre)
          .filter(Boolean)
          .join(', ') ?? '',
      header: 'Clubs',
      cell: ({ row }) => (
        <span>
          {row.original.clubs
            ?.map((dc: DelegadoClubResumenDTO) => dc.clubNombre)
            .filter(Boolean)
            .join(', ') ?? ''}
        </span>
      )
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const clubs = row.original.clubs ?? []
        const estadosUnicos = [
          ...new Map(
            clubs
              .filter((dc) => dc.estadoDelegadoId != null)
              .map(
                (dc) =>
                  [
                    dc.estadoDelegadoId as number,
                    dc.estadoDelegado ?? ''
                  ] as const
              )
          ).entries()
        ]
        if (estadosUnicos.length === 0) return null
        return (
          <div className='flex flex-wrap gap-1'>
            {estadosUnicos.map(([id, texto]) => (
              <span
                key={id}
                className={`px-2 py-0.5 rounded text-xs ${estadoBadgeClassDelegado[id] ?? ''}`}
              >
                {texto}
              </span>
            ))}
          </div>
        )
      }
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-full sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Selección de delegados</DialogTitle>
        </DialogHeader>
        <div className='flex-1 overflow-auto min-h-0'>
          <Tabla<DelegadoListadoDTO>
            columnas={columnas}
            data={delegados ?? []}
            estaCargando={isLoading}
            hayError={false}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            pageSizeDefault={100}
          />
        </div>
        <div className='flex justify-end pt-4 border-t'>
          <Boton
            onClick={handleGenerarPDF}
            disabled={selectedDelegados.length === 0}
            estaCargando={generandoPDF}
          >
            Generar PDF con carnets de delegados seleccionados
            {selectedDelegados.length > 0 && ` (${selectedDelegados.length})`}
          </Boton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
