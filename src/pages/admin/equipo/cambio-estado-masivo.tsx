import { api } from '@/api/api'
import {
  CambiarEstadoDelJugadorDTO,
  EquipoDTO,
  JugadorDelEquipoDTO
} from '@/api/clients'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { ContenedorCargandoYError } from '@/components/cargando-y-error-contenedor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import Tabla from '@/components/ykn-ui/tabla'
import { EstadoJugador } from '@/lib/utils'
import { ColumnDef, Row, Table, RowSelectionState } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCambiarEstadoMutation } from '../jugador/hooks/use-cambiar-estado'

export default function CambioEstadoMasivo() {
  const { equipoid } = useParams<{ equipoid: string }>()
  const [selectedJugadores, setSelectedJugadores] = useState<number[]>([])
  const [motivo, setMotivo] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const {
    data: equipo,
    isError,
    isLoading
  } = useApiQuery<EquipoDTO>({
    key: ['equipo', equipoid],
    fn: async () => await api.equipoGET(Number(equipoid))
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
            setSelectedJugadores(selectedRows.map((row) => row.original.id!))
          }}
        />
      ),
      cell: ({
        row,
        table
      }: {
        row: Row<JugadorDelEquipoDTO>
        table: Table<JugadorDelEquipoDTO>
      }) => (
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

  const suspenderMutation = useCambiarEstadoMutation(
    (dtos) => api.suspenderJugador(dtos),
    'Jugadores suspendidos exitosamente'
  )

  const inhabilitarMutation = useCambiarEstadoMutation(
    (dtos) => api.inhabilitarJugador(dtos),
    'Jugadores inhabilitados exitosamente'
  )

  const activarMutation = useCambiarEstadoMutation(
    (dtos) => api.activarJugador(dtos),
    'Jugadores activados exitosamente'
  )

  const handleAction = (mutation: typeof suspenderMutation) => {
    if (selectedJugadores.length === 0 || !equipo?.jugadores) return

    const jugadores = equipo.jugadores
    const dtos = selectedJugadores
      .map((jugadorEquipoId) => {
        const jugador = jugadores.find((j) => j.id === jugadorEquipoId)
        if (!jugador) return null

        return new CambiarEstadoDelJugadorDTO({
          jugadorId: jugador.id,
          jugadorEquipoId: jugador.jugadorEquipoId,
          motivo
        })
      })
      .filter((dto): dto is CambiarEstadoDelJugadorDTO => dto !== null)

    mutation.mutate(dtos)
  }

  return (
    <ContenedorCargandoYError hayError={isError} estaCargando={isLoading}>
      <Card className='max-w-4xl mx-auto mt-10 p-6 rounded-xl border bg-white'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>
            Cambio de Estado Masivo - {equipo?.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabla
            columnas={columnas}
            data={equipo?.jugadores || []}
            estaCargando={isLoading}
            hayError={isError}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            pageSizeDefault={100}
          />

          <div className='mt-8'>
            <Textarea
              placeholder='Escribí el motivo de este cambio de estado...'
              rows={4}
              className='w-full'
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          <div className='mt-6 flex justify-between items-center'>
            <BotonVolver texto='Volver' />
            <div className='flex gap-2'>
              <Button
                variant='destructive'
                onClick={() => handleAction(inhabilitarMutation)}
                disabled={selectedJugadores.length === 0 || !motivo}
              >
                Inhabilitar
              </Button>
              <Button
                variant='destructive'
                onClick={() => handleAction(suspenderMutation)}
                disabled={selectedJugadores.length === 0 || !motivo}
              >
                Suspender
              </Button>
              <Button
                onClick={() => handleAction(activarMutation)}
                disabled={selectedJugadores.length === 0 || !motivo}
              >
                Activar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </ContenedorCargandoYError>
  )
}
