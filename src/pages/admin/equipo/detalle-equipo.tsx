import { api } from '@/api/api'
import { EquipoDTO, JugadorDelEquipoDTO } from '@/api/clients'
import useApiMutation from '@/api/custom-hooks/use-api-mutation'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import ModalEliminacion from '@/components/modal-eliminacion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { VisibleSoloParaAdmin } from '@/components/visible-solo-para-admin'
import { Boton } from '@/components/ykn-ui/boton'
import BotonVolver from '@/components/ykn-ui/boton-volver'
import DetalleItem from '@/components/ykn-ui/detalle-item'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import Tabla from '@/components/ykn-ui/tabla'
import { EstadoJugador } from '@/lib/utils'
import CambiarEstadoModal from '@/pages/admin/equipo/components/cambiar-estado-modal'
import EfectuarPasesModal from '@/pages/admin/equipo/components/efectuar-pases-modal'
import { generarReportePDF } from '@/pages/admin/equipo/components/reporte-jugadores-pdf'
import { rutasNavegacion } from '@/routes/rutas'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef, Row, RowSelectionState, Table } from '@tanstack/react-table'
import { FileDown, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function DetalleEquipo() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [selectedJugadores, setSelectedJugadores] = useState<number[]>([])
  const [pasesModalOpen, setPasesModalOpen] = useState(false)
  const [cambioEstadoModalOpen, setCambioEstadoModalOpen] = useState(false)

  const {
    data: equipo,
    isError,
    isLoading
  } = useApiQuery<EquipoDTO>({
    key: ['equipo', id],
    fn: async () => await api.equipoGET(Number(id))
  })

  const { data: jugadoresExclusivos, isLoading: isLoadingJugadoresExclusivos } =
    useQuery({
      queryKey: ['jugadores-equipo-exclusivos', id],
      queryFn: () => api.jugadoresQueSoloJueganEnEsteEquipo(Number(id)),
      enabled: !!equipo
    })

  useEffect(() => {
    if (!equipo?.jugadores) return
    const selectedIds = Object.keys(rowSelection)
      .filter((key) => (rowSelection as Record<string, boolean>)[key])
      .map((key) => equipo.jugadores && equipo.jugadores[parseInt(key)]?.id)
      .filter((jugadorId): jugadorId is number => jugadorId !== undefined)
    setSelectedJugadores(selectedIds as number[])
  }, [rowSelection, equipo?.jugadores])

  const eliminarMutation = useApiMutation<void>({
    fn: async () => {
      await api.equipoDELETE(Number(id))
    },
    antesDeMensajeExito: () =>
      navigate(
        equipo?.clubId
          ? `${rutasNavegacion.detalleClub}/${equipo.clubId}`
          : rutasNavegacion.equipos
      ),
    mensajeDeExito: `El equipo '${equipo?.nombre}' fue eliminado.`
  })

  const handleGenerarReportePDF = async () => {
    if (equipo) {
      await generarReportePDF(equipo)
    }
  }

  const listaJugadoresExclusivos = isLoadingJugadoresExclusivos
    ? 'Cargando...'
    : jugadoresExclusivos && jugadoresExclusivos.length > 0
      ? jugadoresExclusivos.map((j) => `${j.nombre} ${j.apellido}`).join(', ')
      : 'Ninguno'

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

  if (isError) {
    return (
      <Alert variant='destructive' className='mb-4'>
        <AlertTitle className='text-xl font-semibold'>Error</AlertTitle>
        <AlertDescription>
          No se pudieron recuperar los datos del equipo.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className='max-w-md mx-auto mt-10'>
        <Skeleton className='h-16 w-64' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
        <Skeleton className='h-8 w-64 my-3' />
      </div>
    )
  }

  return (
    <>
      <Card className='max-w-4xl mx-auto p-4'>
        <CardHeader className='flex flex-row items-start justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <BotonVolver className='-ml-2' />
            <CardTitle>{equipo!.nombre}</CardTitle>
          </div>
          <div className='flex gap-2 shrink-0'>
            <Boton
              variant='outline'
              className='group h-10 w-10 min-w-10 gap-0 overflow-hidden px-0 transition-[width,gap,padding] duration-200 hover:w-auto hover:min-w-40 hover:gap-2 hover:px-3'
              onClick={handleGenerarReportePDF}
            >
              <FileDown className='h-5 w-5 shrink-0' />
              <span className='max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-200 group-hover:max-w-40'>
                Generar Reporte PDF
              </span>
            </Boton>
            <VisibleSoloParaAdmin>
              <Boton
                variant='outline'
                className='group h-10 w-10 min-w-10 gap-0 overflow-hidden px-0 transition-[width,gap,padding] duration-200 hover:w-auto hover:min-w-24 hover:gap-2 hover:px-3'
                onClick={() =>
                  navigate(`${rutasNavegacion.editarEquipo}/${equipo!.id}`)
                }
              >
                <Pencil className='h-5 w-5 shrink-0' />
                <span className='max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-200 group-hover:max-w-20'>
                  Editar
                </span>
              </Boton>
              <ModalEliminacion
                titulo={`Eliminar definitivamente al equipo ${equipo!.nombre}`}
                subtitulo={`Al eliminar el equipo, se eliminarán también los jugadores que solo jueguen en este equipo. Son: ${listaJugadoresExclusivos}`}
                eliminarOnClick={() => eliminarMutation.mutate(undefined)}
                eliminarTexto='Eliminar definitivamente equipo y jugadores'
                trigger={
                  <Boton
                    variant='destructive'
                    className='group h-10 w-10 min-w-10 gap-0 overflow-hidden px-0 transition-[width,gap,padding] duration-200 hover:w-auto hover:min-w-32 hover:gap-2 hover:px-3'
                    estaCargando={eliminarMutation.isPending}
                  >
                    <Trash2 className='h-5 w-5 shrink-0' />
                    <span className='max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-200 group-hover:max-w-32'>
                      Eliminar equipo
                    </span>
                  </Boton>
                }
                estaCargando={eliminarMutation.isPending}
              />
            </VisibleSoloParaAdmin>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-4 space-y-2'>
            <DetalleItem clave='Club' valor={equipo!.clubNombre!} />
            <DetalleItem
              clave='Torneo'
              valor={equipo!.torneoNombre || 'No asignado'}
            />
            <DetalleItem clave='Código' valor={equipo!.codigoAlfanumerico!} />
          </div>
          <h2 className='text-md font-bold mb-4'>Jugadores</h2>
          <Tabla
            columnas={columnas}
            data={equipo!.jugadores || []}
            estaCargando={isLoading}
            hayError={isError}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            pageSizeDefault={100}
          />
          <VisibleSoloParaAdmin>
            <div className='mt-6 flex gap-2'>
              <Button
                variant='outline'
                disabled={selectedJugadores.length === 0}
                onClick={() => setPasesModalOpen(true)}
              >
                Efectuar pases
              </Button>
              <Button
                variant='outline'
                disabled={selectedJugadores.length === 0}
                onClick={() => setCambioEstadoModalOpen(true)}
              >
                Cambiar estado
              </Button>
            </div>
          </VisibleSoloParaAdmin>
        </CardContent>
      </Card>

      {equipo && (
        <>
          <EfectuarPasesModal
            open={pasesModalOpen}
            onOpenChange={setPasesModalOpen}
            equipo={equipo}
            selectedJugadores={selectedJugadores}
          />
          <CambiarEstadoModal
            open={cambioEstadoModalOpen}
            onOpenChange={setCambioEstadoModalOpen}
            equipo={equipo}
            selectedJugadores={selectedJugadores}
          />
        </>
      )}
    </>
  )
}
