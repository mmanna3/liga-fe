import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import { Label } from '@/design-system/base-ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/design-system/base-ui/select'
import { useMemo } from 'react'

function obtenerOpcionesAnio(): { value: string; label: string }[] {
  const anioActual = new Date().getFullYear()
  const opciones: { value: string; label: string }[] = []
  for (let a = anioActual; a >= anioActual - 20; a--) {
    opciones.push({ value: String(a), label: String(a) })
  }
  return opciones
}

interface FiltrosBuscadorDeEquiposProps {
  filtroAnio: number
  onFiltroAnioChange: (anio: number) => void
  filtroAgrupadorId: string
  onFiltroAgrupadorIdChange: (id: string) => void
  filtroTorneoId: string
  onFiltroTorneoIdChange: (id: string) => void
  filtroFaseId: string
  onFiltroFaseIdChange: (id: string) => void
  filtroZonaId: string
  onFiltroZonaIdChange: (id: string) => void
}

export function FiltrosBuscadorDeEquipos({
  filtroAnio,
  onFiltroAnioChange,
  filtroAgrupadorId,
  onFiltroAgrupadorIdChange,
  filtroTorneoId,
  onFiltroTorneoIdChange,
  filtroFaseId,
  onFiltroFaseIdChange,
  filtroZonaId,
  onFiltroZonaIdChange
}: FiltrosBuscadorDeEquiposProps) {
  const anioActual = new Date().getFullYear()
  const opcionesAnio = useMemo(() => obtenerOpcionesAnio(), [])

  const { data: agrupadores = [] } = useApiQuery({
    key: ['torneoAgrupadorAll'],
    fn: () => api.torneoAgrupadorAll()
  })

  const { data: torneosTodos = [] } = useApiQuery({
    key: ['torneoAll'],
    fn: () => api.torneoAll()
  })

  const torneos = useMemo(() => {
    return torneosTodos.filter((t) => {
      if (t.anio !== filtroAnio) return false
      if (
        filtroAgrupadorId &&
        t.torneoAgrupadorId !== parseInt(filtroAgrupadorId, 10)
      )
        return false
      return true
    })
  }, [torneosTodos, filtroAnio, filtroAgrupadorId])

  const torneoSeleccionado = useMemo(
    () => torneos.find((t) => String(t.id) === filtroTorneoId),
    [torneos, filtroTorneoId]
  )

  const { data: fases = [] } = useApiQuery({
    key: ['fasesAll', torneoSeleccionado?.id],
    fn: () => api.fasesAll(torneoSeleccionado!.id!),
    activado: !!torneoSeleccionado?.id
  })

  const faseSeleccionada = useMemo(
    () => fases.find((f) => String(f.id) === filtroFaseId),
    [fases, filtroFaseId]
  )

  const { data: zonas = [] } = useApiQuery({
    key: ['zonasAll', faseSeleccionada?.id],
    fn: () => api.zonasAll(faseSeleccionada!.id!),
    activado: !!faseSeleccionada?.id
  })

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-lg border bg-muted/30'>
      <div className='space-y-2'>
        <Label>Año</Label>
        <Select
          value={String(filtroAnio)}
          onValueChange={(v) =>
            onFiltroAnioChange(parseInt(v, 10) || anioActual)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Año' />
          </SelectTrigger>
          <SelectContent>
            {opcionesAnio.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Agrupador</Label>
        <Select
          value={filtroAgrupadorId || 'todos'}
          onValueChange={(v) =>
            onFiltroAgrupadorIdChange(v === 'todos' ? '' : v)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Agrupador' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todos'>Todos</SelectItem>
            {agrupadores.map((a) => (
              <SelectItem key={a.id} value={String(a.id ?? 0)}>
                {a.nombre ?? ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Torneo</Label>
        <Select
          value={filtroTorneoId || 'todos'}
          onValueChange={(v) => onFiltroTorneoIdChange(v === 'todos' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder='Torneo' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todos'>Todos</SelectItem>
            {torneos.map((t) => (
              <SelectItem key={t.id} value={String(t.id ?? 0)}>
                {t.nombre ?? ''} ({t.anio ?? ''})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Fase</Label>
        <Select
          value={filtroFaseId || 'todas'}
          onValueChange={(v) => onFiltroFaseIdChange(v === 'todas' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder='Fase' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todas'>Todas</SelectItem>
            {fases.map((f) => (
              <SelectItem key={f.id} value={String(f.id ?? 0)}>
                {f.nombre ?? ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Zona</Label>
        <Select
          value={filtroZonaId || 'todas'}
          onValueChange={(v) => onFiltroZonaIdChange(v === 'todas' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder='Zona' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todas'>Todas</SelectItem>
            {zonas.map((z) => (
              <SelectItem key={z.id} value={String(z.id ?? 0)}>
                {z.nombre ?? ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
