import { api } from '@/api/api'
import { EquipoDelJugadorDTO, JugadorDTO } from '@/api/clients'
import { EstadoJugadorEnum } from '@/api/clients'
import JugadorEquipoEstadoBadge from '@/components/ykn-ui/jugador-equipo-estado-badge'
import Tabla from '@/components/ykn-ui/tabla'
import useApiQuery from '@/api/custom-hooks/use-api-query'
import { useAuth } from '@/hooks/use-auth'
import { EstadoJugador } from '@/lib/utils'
import { rutasNavegacion } from '@/routes/rutas'
import { ColumnDef } from '@tanstack/react-table'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Sliders } from 'react-feather'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

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
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const esAdmin = useAuth((state) => state.esAdmin)
  const [filtroEstados, setFiltroEstados] = useState<EstadoJugador[]>([])

  useEffect(() => {
    const filtrosParam = searchParams.get('filtros')
    if (filtrosParam) {
      const estadosFromUrl = filtrosParam
        .split(',')
        .map(Number) as EstadoJugador[]
      setFiltroEstados(estadosFromUrl)
    }
  }, [searchParams])

  const toggleFiltro = (estado: EstadoJugador) => {
    const nuevosEstados = filtroEstados.includes(estado)
      ? filtroEstados.filter((e) => e !== estado)
      : [...filtroEstados, estado]

    setFiltroEstados(nuevosEstados)

    const newSearchParams = new URLSearchParams(searchParams)
    if (nuevosEstados.length > 0) {
      newSearchParams.set('filtros', nuevosEstados.join(','))
    } else {
      newSearchParams.delete('filtros')
    }

    navigate({
      pathname: location.pathname,
      search: newSearchParams.toString()
    })
  }

  const { data, isLoading, isError } = useApiQuery({
    key: ['jugadores', filtroEstados.toString()],
    fn: async () =>
      await api.listarConFiltro(filtroEstados as unknown as EstadoJugadorEnum[])
  })

  const filtro = (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          title='Filtrar por estado'
          className='inline-flex items-center justify-center gap-1 rounded-md border border-input bg-background p-2 text-sm hover:bg-accent cursor-pointer'
        >
          <Sliders className='h-4 w-4 shrink-0' />
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

  const columnas: ColumnDef<JugadorDTO>[] = [
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
      accessorKey: 'equipos',
      header: 'Equipo',
      cell: ({ row }) => (
        <span>
          {(row.getValue('equipos') as EquipoDelJugadorDTO[]).length > 0
            ? (row.getValue('equipos') as EquipoDelJugadorDTO[])[0].nombre
            : ''}
        </span>
      )
    },
    {
      accessorKey: 'equipos',
      header: 'Torneo',
      cell: ({ row }) => (
        <span>
          {/* El mapeo de este request deja a todos los jugadores con un array de 1 equipo */}
          {(row.getValue('equipos') as EquipoDelJugadorDTO[]).length > 0
            ? (row.getValue('equipos') as EquipoDelJugadorDTO[])[0].torneo
            : ''}
        </span>
      )
    },
    {
      accessorKey: 'equipos',
      header: 'Estado',
      cell: ({ row }) => {
        if ((row.getValue('equipos') as EquipoDelJugadorDTO[]).length === 0) {
          return ''
        }

        const equipo = (row.getValue('equipos') as EquipoDelJugadorDTO[])[0]
        const estado = equipo.estado as unknown as EstadoJugador
        const esPendienteORechazo =
          estado === EstadoJugador.FichajePendienteDeAprobacion ||
          estado === EstadoJugador.FichajeRechazado

        return (
          <div
            className={esPendienteORechazo && esAdmin() ? 'cursor-pointer' : ''}
            onClick={(e) => {
              e.stopPropagation()
              if (esPendienteORechazo && esAdmin()) {
                navigate(
                  `${rutasNavegacion.aprobarRechazarJugador}/${equipo.id}/${row.original.id}`
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
  ]

  return (
    <Tabla<JugadorDTO>
      columnas={columnas}
      data={data || []}
      estaCargando={isLoading}
      hayError={isError}
      filtro={filtro}
      onRowClick={(row) =>
        navigate(`${rutasNavegacion.detalleJugador}/${row.original.id}`)
      }
    />
  )
}
