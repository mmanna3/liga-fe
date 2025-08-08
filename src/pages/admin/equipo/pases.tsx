import { api } from '@/api/api'
import {
  EfectuarPaseDTO,
  EquipoDTO,
  JugadorDelEquipoDTO
} from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { ContenedorCargandoYError } from '@/components/cargando-y-error-contenedor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import Tabla from '@/components/ykn-ui/tabla'
import { EstadoJugador } from '@/lib/utils'
import { ColumnDef, Row, Table, RowSelectionState } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEfectuarPaseMutation } from '../jugador/hooks/use-efectuar-pase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function Pases() {
  const { equipoid } = useParams<{ equipoid: string }>()
  const [selectedJugadores, setSelectedJugadores] = useState<number[]>([])
  const [equipoDestinoId, setEquipoDestinoId] = useState<string>('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const {
    data: equipo,
    isError,
    isLoading
  } = useApiQuery<EquipoDTO>({
    key: ['equipo', equipoid],
    fn: async () => await api.equipoGET(Number(equipoid))
  })

  const {
    data: equipos
  } = useApiQuery<EquipoDTO[]>({
    key: ['equipos'],
    fn: async () => {
      const response = await api.equipoAll()
      return response
    }
  })

  useEffect(() => {
    if (!equipo?.jugadores) return
    // Actualiza selectedJugadores cada vez que cambia rowSelection
    const selectedIds = Object.keys(rowSelection)
      .filter((key) => (rowSelection as Record<string, boolean>)[key])
      .map((key) => equipo.jugadores && equipo.jugadores[parseInt(key)]?.id)
      .filter((id) => id !== undefined)
    setSelectedJugadores(selectedIds as number[])
    console.log(selectedIds)
  }, [rowSelection, equipo?.jugadores])

  const columnas: ColumnDef<JugadorDelEquipoDTO>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            const selectedRows = table.getSelectedRowModel().rows
            setSelectedJugadores(selectedRows.map(row => row.original.id!))
          }}
        />
      ),
      cell: ({ row, table }: { row: Row<JugadorDelEquipoDTO>; table: Table<JugadorDelEquipoDTO> }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
            const selectedRows = table.getSelectedRowModel().rows
            setSelectedJugadores(selectedRows.map((r) => r.original.id!))
          }}
        />
      )
    },
    {
      accessorKey: 'dni',
      header: 'DNI'
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
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => (
        <JugadorEquipoEstadoBadge
          estado={row.getValue('estado') as EstadoJugador}
        />
      )
    }
  ]

  const efectuarPasesMutation = useEfectuarPaseMutation(
    (dtos) => api.efectuarPases(dtos),
    'Pases efectuados exitosamente'
  )

  const handleAction = (mutation: typeof efectuarPasesMutation) => {
    if (selectedJugadores.length === 0 || !equipo?.jugadores) return

    const jugadores = equipo.jugadores
    const dtos = selectedJugadores
      .map((jugadorEquipoId) => {
        const jugador = jugadores.find((j) => j.id === jugadorEquipoId)
        if (!jugador) return null

        return new EfectuarPaseDTO({
          jugadorId: jugador.id,
          equipoDestinoId: Number(equipoDestinoId),
          equipoOrigenId: equipo.id
        })
      })
      .filter((dto): dto is EfectuarPaseDTO => dto !== null)

    mutation.mutate(dtos)
  }

  return (
    <ContenedorCargandoYError hayError={isError} estaCargando={isLoading}>
      <Card className='max-w-4xl mx-auto mt-10 p-6 rounded-xl border bg-white'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>
            Pases - {equipo?.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent>

        <div className='space-y-2 w-96 ml-auto'>
            <Select value={equipoDestinoId} onValueChange={setEquipoDestinoId} required>
              <SelectTrigger id='equipoDestinoId'>
                <SelectValue placeholder='Seleccionar equipo destino' />
              </SelectTrigger>
              <SelectContent>
                {equipos?.filter((e) => e.id !== equipo?.id).map((e) => (
                  <SelectItem key={e.id} value={e.id!.toString()}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabla
            columnas={columnas}
            data={equipo?.jugadores || []}
            estaCargando={isLoading}
            hayError={isError}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            pageSizeDefault={100}
          />

          <div className='mt-6 flex justify-between items-center'>
            <BotonVolver texto='Volver' />
            <div className='flex gap-2'>
              <Button
                onClick={() => handleAction(efectuarPasesMutation)}
                disabled={selectedJugadores.length === 0 || !equipoDestinoId}
              >
                Efectuar los pases al equipo seleccionado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </ContenedorCargandoYError>
  )
}
