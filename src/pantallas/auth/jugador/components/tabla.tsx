import { api } from '@/api/api'
import { JugadorListadoDTO } from '@/api/clients'
import { EstadoJugadorEnum } from '@/api/clients'
import JugadorEquipoEstadoBadge from '@/design-system/ykn-ui/jugador-equipo-estado-badge'
import Tabla from '@/design-system/ykn-ui/tabla'
import useApiQuery from '@/api/hooks/use-api-query'
import { useAuth } from '@/logica-compartida/hooks/use-auth'
import { EstadoJugador } from '@/logica-compartida/utils'
import { rutasNavegacion } from '@/ruteo/rutas'
import { useJugadoresListaUiStore } from '../stores/use-jugadores-lista-ui-store'
import { useTablaListaUi } from '@/logica-compartida/hooks/use-tabla-lista-ui'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/design-system/base-ui/popover'
import Icono from '@/design-system/ykn-ui/icono'
import { useNavigate } from 'react-router-dom'

const estadoConfigArray = [
  {
    key: EstadoJugador.FichajePendienteDeAprobacion,
    label: 'Pendiente de aprobación'
  },
  { key: EstadoJugador.FichajeRechazado, label: 'Fichaje rechazado' },
  {
    key: EstadoJugador.AprobadoPendienteDePago,
    label: 'Aprobado pendiente de pago'
  },
  { key: EstadoJugador.Activo, label: 'Activo' },
  { key: EstadoJugador.Suspendido, label: 'Suspendido' },
  { key: EstadoJugador.Inhabilitado, label: 'Inhabilitado' }
]

export default function TablaJugador() {
  const navigate = useNavigate()
  const esAdmin = useAuth((state) => state.esAdmin)
  const filtroEstados = useJugadoresListaUiStore((s) => s.filtroEstados)
  const toggleFiltro = useJugadoresListaUiStore((s) => s.toggleFiltro)
  const tablaListaUi = useTablaListaUi(useJugadoresListaUiStore)

  const { data, isLoading, isError } = useApiQuery({
    key: ['jugadores', filtroEstados.toString()],
    fn: async () =>
      await api.jugadoresListado(
        filtroEstados as unknown as EstadoJugadorEnum[]
      )
  })

  const filtro = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          title='Filtrar por estado'
          className='inline-flex items-center justify-center gap-1 rounded-md border border-input bg-background p-2 text-sm hover:bg-accent cursor-pointer'
        >
          <Icono nombre='Filtros' className='h-4 w-4 shrink-0' />
          {filtroEstados.length > 0 && (
            <span className='bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs'>
              {filtroEstados.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-60 flex flex-col gap-1'>
        {estadoConfigArray.map(({ key }) => (
          <div
            key={key}
            className={`cursor-pointer flex items-center gap-2 p-2 rounded-md ${
              filtroEstados.includes(key) ? 'bg-blue-100' : ''
            }`}
            onClick={() => toggleFiltro(key)}
          >
            <JugadorEquipoEstadoBadge estado={key} />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )

  const columnas = useMemo<ColumnDef<JugadorListadoDTO>[]>(
    () => [
      {
        accessorKey: 'dni',
        header: 'DNI',
        cell: ({ row }) => <span>{row.getValue('dni')}</span>
      },
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: ({ row }) => <span>{row.getValue('nombre')}</span>
      },
      {
        accessorKey: 'apellido',
        header: 'Apellido',
        cell: ({ row }) => <span>{row.getValue('apellido')}</span>
      },
      {
        accessorKey: 'equipoNombre',
        header: 'Equipo',
        cell: ({ row }) => <span>{row.getValue('equipoNombre')}</span>
      },
      {
        accessorKey: 'club',
        header: 'Club',
        cell: ({ row }) => <span>{row.getValue('club')}</span>
      },
      {
        accessorKey: 'torneo',
        header: 'Torneo',
        cell: ({ row }) => <span>{row.getValue('torneo')}</span>
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
          const estado = row.original.estado as unknown as EstadoJugador
          const esPendienteORechazo =
            estado === EstadoJugador.FichajePendienteDeAprobacion ||
            estado === EstadoJugador.FichajeRechazado

          return (
            <div
              className={
                esPendienteORechazo && esAdmin() ? 'cursor-pointer' : ''
              }
              onClick={(e) => {
                e.stopPropagation()
                if (esPendienteORechazo && esAdmin()) {
                  navigate(
                    `${rutasNavegacion.aprobarRechazarJugador}/${row.original.jugadorEquipoId}/${row.original.id}`
                  )
                }
              }}
            >
              <JugadorEquipoEstadoBadge estado={estado} />
            </div>
          )
        }
      },
      {
        id: 'esDelegado',
        header: 'Es delegado',
        cell: ({ row }) =>
          row.original.delegadoId != null ? (
            <span className='flex justify-center text-green-600 font-bold'>
              ✓
            </span>
          ) : null
      }
    ],
    [esAdmin, navigate]
  )

  return (
    <Tabla<JugadorListadoDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      filtro={filtro}
      {...tablaListaUi}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.detalleJugador}/${row.original.id}`)
      }
    />
  )
}
