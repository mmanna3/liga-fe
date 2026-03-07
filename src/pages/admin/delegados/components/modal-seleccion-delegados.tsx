import { api } from '@/api/api'
import { DelegadoClubDTO, DelegadoDTO } from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Boton } from '@/components/ykn-ui/boton'
import Tabla from '@/components/ykn-ui/tabla'
import { estadoBadgeClassDelegado } from '@/lib/utils'
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
  const { data: delegados = [], isLoading } = useApiQuery<DelegadoDTO[]>({
    key: ['delegados-seleccion', open ? 'open' : 'closed'],
    fn: () => api.listarDelegadosConFiltro(undefined),
    activado: open
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [selectedDelegados, setSelectedDelegados] = useState<DelegadoDTO[]>([])
  const [generandoPDF, setGenerandoPDF] = useState(false)

  useEffect(() => {
    if (!delegados?.length) return
    const selected = Object.keys(rowSelection)
      .filter((key) => (rowSelection as Record<string, boolean>)[key])
      .map((key) => delegados[parseInt(key, 10)])
      .filter((d): d is DelegadoDTO => d != null)
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
      await generarCarnetsDelegadosPDF([
        ...delegadosCompletos,
        ...delegadosCompletos,
        ...delegadosCompletos,
        ...delegadosCompletos
      ])
      onOpenChange(false)
    } finally {
      setGenerandoPDF(false)
    }
  }

  const columnas: ColumnDef<DelegadoDTO>[] = [
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
      cell: ({ row }: { row: Row<DelegadoDTO> }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      )
    },
    {
      id: 'nombreUsuario',
      accessorFn: (row) => row.usuario?.nombreUsuario,
      header: 'Usuario',
      cell: ({ row }) => (
        <span>{row.original.usuario?.nombreUsuario ?? ''}</span>
      )
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
      header: 'Clubs',
      cell: ({ row }) => (
        <span>
          {row.original.delegadoClubs
            ?.map((dc: DelegadoClubDTO) => dc.clubNombre)
            .filter(Boolean)
            .join(', ') ?? ''}
        </span>
      )
    },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const clubs = row.original.delegadoClubs ?? []
        const estadosUnicos = [
          ...new Map(
            clubs
              .map((dc) => dc.estadoDelegado)
              .filter((e): e is NonNullable<typeof e> => e != null)
              .map((e) => [e.id, e])
          ).values()
        ]
        if (estadosUnicos.length === 0) return null
        return (
          <div className='flex flex-wrap gap-1'>
            {estadosUnicos.map((estado) => (
              <span
                key={estado.id}
                className={`px-2 py-0.5 rounded text-xs ${estadoBadgeClassDelegado[estado.id!] ?? ''}`}
              >
                {estado.estado}
              </span>
            ))}
          </div>
        )
      }
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='left-[55%]! top-[30%] w-full -translate-x-1/2! sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Selección de delegados</DialogTitle>
        </DialogHeader>
        <div className='flex-1 overflow-auto min-h-0'>
          <Tabla<DelegadoDTO>
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
