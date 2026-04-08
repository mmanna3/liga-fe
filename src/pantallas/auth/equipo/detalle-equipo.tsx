import { api } from '@/api/api'
import { EquipoDTO, JugadorDelEquipoDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/design-system/base-ui/alert'
import { Checkbox } from '@/design-system/base-ui/checkbox'
import { Skeleton } from '@/design-system/base-ui/skeleton'
import { VisibleSoloParaAdmin } from '@/design-system/visible-solo-para-admin'
import { Boton } from '@/design-system/ykn-ui/boton'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import JugadorEquipoEstadoBadge from '@/design-system/ykn-ui/jugador-equipo-estado-badge'
import Tabla from '@/design-system/ykn-ui/tabla'
import { EstadoJugador } from '@/logica-compartida/utils'
import { useBotoneraDetalleEquipo } from '@/pantallas/auth/equipo/components/botonera-detalle-equipo'
import CambiarEstadoModal from '@/pantallas/auth/equipo/components/cambiar-estado-modal'
import EfectuarPasesModal from '@/pantallas/auth/equipo/components/efectuar-pases-modal'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef, Row, RowSelectionState, Table } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function DetalleEquipo() {
  const { id } = useParams<{ id: string }>()
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

  const jugadores = isLoadingJugadoresExclusivos
    ? 'Cargando...'
    : jugadoresExclusivos && jugadoresExclusivos.length > 0
      ? jugadoresExclusivos.map((j) => `${j.nombre} ${j.apellido}`).join(', ')
      : 'Ninguno'

  const botoneraProps = useBotoneraDetalleEquipo({
    equipo: equipo ?? ({} as EquipoDTO),
    jugadores
  })

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
      accessorKey: 'anioNacimiento',
      header: 'Categoría',
      cell: ({ row }) => row.original.anioNacimiento ?? '—'
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

  const anioActual = new Date().getFullYear()

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
      <FlujoHomeLayout
        titulo={equipo!.nombre}
        botonera={botoneraProps}
        detalleItems={[
          { clave: 'Club', valor: equipo!.clubNombre! },
          {
            clave: `Torneos ${anioActual}`,
            valor: equipo!.zonas?.length
              ? [
                  ...new Set(
                    equipo!.zonas
                      .filter((z) => z.anio === anioActual)
                      .map((z) => z.torneo)
                      .filter(Boolean)
                  )
                ].join(', ') || '-'
              : '-'
          },
          { clave: 'Código', valor: equipo!.codigoAlfanumerico! }
        ]}
        contenido={
          <>
            <Tabla
              columnas={columnas}
              data={(equipo!.jugadores ?? []) as JugadorDelEquipoDTO[]}
              estaCargando={isLoading}
              hayError={isError}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              pageSizeDefault={100}
            />
            <VisibleSoloParaAdmin>
              <div className='mt-6 flex gap-2'>
                <Boton
                  variant='outline'
                  disabled={selectedJugadores.length === 0}
                  onClick={() => setPasesModalOpen(true)}
                >
                  Efectuar pases
                </Boton>
                <Boton
                  variant='outline'
                  disabled={selectedJugadores.length === 0}
                  onClick={() => setCambioEstadoModalOpen(true)}
                >
                  Cambiar estado
                </Boton>
              </div>
            </VisibleSoloParaAdmin>
          </>
        }
      />

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
