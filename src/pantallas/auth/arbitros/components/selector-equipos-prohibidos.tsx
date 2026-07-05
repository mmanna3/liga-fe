import { api } from '@/api/api'
import {
  EquipoParaZonasDTO,
  type ArbitroEquipoProhibidoDTO
} from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import { Button } from '@/design-system/base-ui/button'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/design-system/base-ui/popover'
import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  formatearLineaEquipoProhibido,
  obtenerTorneosActualesDeEquipo
} from '../utilidades-equipos-prohibidos'

interface SelectorEquiposProhibidosProps {
  valor: number[]
  equiposIniciales?: ArbitroEquipoProhibidoDTO[]
  alCambiar: (ids: number[]) => void
  titulo?: string
  deshabilitado?: boolean
}

function coincideBusquedaEquipo(
  equipo: EquipoParaZonasDTO,
  busqueda: string
): boolean {
  const t = busqueda.trim().toLowerCase()
  if (!t) return true
  return (
    (equipo.nombre?.toLowerCase().includes(t) ?? false) ||
    (equipo.club?.toLowerCase().includes(t) ?? false) ||
    (equipo.codigoAlfanumerico?.toLowerCase().includes(t) ?? false)
  )
}

export default function SelectorEquiposProhibidos({
  valor,
  equiposIniciales = [],
  alCambiar,
  titulo = 'Equipos prohibidos',
  deshabilitado = false
}: SelectorEquiposProhibidosProps) {
  const anioActual = new Date().getFullYear()
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState('')

  const { data: equipos = [], isLoading } = useApiQuery({
    key: ['equiposParaZonas'],
    fn: () => api.equiposParaZonas()
  })

  const equiposPorId = useMemo(() => {
    const mapa = new Map<number, EquipoParaZonasDTO>()
    for (const e of equipos) {
      if (e.id != null) mapa.set(e.id, e)
    }
    for (const e of equiposIniciales) {
      if (e.equipoId != null && !mapa.has(e.equipoId)) {
        mapa.set(
          e.equipoId,
          new EquipoParaZonasDTO({
            id: e.equipoId,
            nombre: e.nombre,
            club: e.clubNombre,
            codigoAlfanumerico: e.codigoAlfanumerico,
            zonas: []
          })
        )
      }
    }
    return mapa
  }, [equipos, equiposIniciales])

  const torneosPorEquipoId = useMemo(() => {
    const mapa = new Map<number, string[]>()
    for (const [id, equipo] of equiposPorId) {
      const desdeZonas = obtenerTorneosActualesDeEquipo(
        equipo.zonas,
        anioActual
      )
      const desdeInicial = equiposIniciales.find(
        (e) => e.equipoId === id
      )?.torneosActuales
      mapa.set(id, desdeZonas.length > 0 ? desdeZonas : (desdeInicial ?? []))
    }
    return mapa
  }, [equiposPorId, equiposIniciales, anioActual])

  const opcionesFiltradas = useMemo(
    () =>
      equipos.filter(
        (e) =>
          e.id != null &&
          !valor.includes(e.id) &&
          coincideBusquedaEquipo(e, busqueda)
      ),
    [equipos, valor, busqueda]
  )

  const agregar = (equipoId: number) => {
    alCambiar([...valor, equipoId])
    setAbierto(false)
    setBusqueda('')
  }

  const quitar = (equipoId: number) => {
    alCambiar(valor.filter((id) => id !== equipoId))
  }

  return (
    <div data-testid='selector-equipos-prohibidos'>
      <Label className='mb-2 block text-md font-semibold'>{titulo}</Label>
      <p className='mb-2 text-sm text-muted-foreground'>
        Equipos que este árbitro no debe dirigir. La asignación no se bloquea,
        pero se muestra una advertencia en Próxima fecha.
      </p>

      <Popover
        open={abierto}
        onOpenChange={(open) => {
          setAbierto(open)
          if (!open) setBusqueda('')
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='outline'
            disabled={deshabilitado || isLoading}
            className='w-full justify-start font-normal'
          >
            {isLoading
              ? 'Cargando equipos…'
              : 'Buscar equipo por nombre, club o código…'}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='w-[var(--radix-popover-trigger-width)] p-0'
          align='start'
        >
          <div className='border-b border-border p-2'>
            <Input
              placeholder='Buscar…'
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
            />
          </div>
          <ul className='max-h-60 overflow-y-auto p-1'>
            {opcionesFiltradas.length === 0 ? (
              <li className='px-2 py-3 text-center text-sm text-muted-foreground'>
                No hay equipos que coincidan
              </li>
            ) : (
              opcionesFiltradas.map((equipo) => {
                const torneos = obtenerTorneosActualesDeEquipo(
                  equipo.zonas,
                  anioActual
                )
                return (
                  <li key={equipo.id}>
                    <button
                      type='button'
                      className='w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-accent'
                      onClick={() => agregar(equipo.id!)}
                    >
                      <div>
                        {formatearLineaEquipoProhibido(
                          equipo.codigoAlfanumerico,
                          equipo.nombre,
                          equipo.club
                        )}
                      </div>
                      {torneos.length > 0 && (
                        <div className='text-xs text-muted-foreground'>
                          {torneos.join(', ')}
                        </div>
                      )}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </PopoverContent>
      </Popover>

      {valor.length > 0 && (
        <ul className='mt-3 space-y-2'>
          {valor.map((equipoId) => {
            const equipo = equiposPorId.get(equipoId)
            const torneos = torneosPorEquipoId.get(equipoId) ?? []
            return (
              <li
                key={equipoId}
                className='flex items-start justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2'
              >
                <div className='min-w-0'>
                  <div className='text-sm font-medium'>
                    {formatearLineaEquipoProhibido(
                      equipo?.codigoAlfanumerico,
                      equipo?.nombre,
                      equipo?.club
                    )}
                  </div>
                  {torneos.length > 0 && (
                    <div className='text-xs text-muted-foreground'>
                      {torneos.join(', ')}
                    </div>
                  )}
                </div>
                <button
                  type='button'
                  className='shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
                  aria-label='Quitar equipo'
                  disabled={deshabilitado}
                  onClick={() => quitar(equipoId)}
                >
                  <X className='h-4 w-4' />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
