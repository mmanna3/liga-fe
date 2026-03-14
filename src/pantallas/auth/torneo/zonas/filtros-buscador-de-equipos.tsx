import { api } from '@/api/api'
import useApiQuery from '@/api/hooks/use-api-query'
import { ListaDesplegable } from '@/design-system/ykn-ui/lista-desplegable'
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
      <ListaDesplegable
        titulo='Año'
        opciones={opcionesAnio}
        valor={String(filtroAnio)}
        alCambiar={(v) => onFiltroAnioChange(parseInt(v, 10) || anioActual)}
        placeholder='Año'
      />
      <ListaDesplegable
        titulo='Agrupador'
        opciones={[
          { value: 'todos', label: 'Todos' },
          ...agrupadores.map((a) => ({
            value: String(a.id ?? 0),
            label: a.nombre ?? ''
          }))
        ]}
        valor={filtroAgrupadorId || 'todos'}
        alCambiar={(v) => onFiltroAgrupadorIdChange(v === 'todos' ? '' : v)}
        placeholder='Agrupador'
      />
      <ListaDesplegable
        titulo='Torneo'
        opciones={[
          { value: 'todos', label: 'Todos' },
          ...torneos.map((t) => ({
            value: String(t.id ?? 0),
            label: `${t.nombre ?? ''} (${t.anio ?? ''})`
          }))
        ]}
        valor={filtroTorneoId || 'todos'}
        alCambiar={(v) => onFiltroTorneoIdChange(v === 'todos' ? '' : v)}
        placeholder='Torneo'
      />
      <ListaDesplegable
        titulo='Fase'
        opciones={[
          { value: 'todas', label: 'Todas' },
          ...fases.map((f) => ({
            value: String(f.id ?? 0),
            label: f.nombre ?? ''
          }))
        ]}
        valor={filtroFaseId || 'todas'}
        alCambiar={(v) => onFiltroFaseIdChange(v === 'todas' ? '' : v)}
        placeholder='Fase'
      />
      <ListaDesplegable
        titulo='Zona'
        opciones={[
          { value: 'todas', label: 'Todas' },
          ...zonas.map((z) => ({
            value: String(z.id ?? 0),
            label: z.nombre ?? ''
          }))
        ]}
        valor={filtroZonaId || 'todas'}
        alCambiar={(v) => onFiltroZonaIdChange(v === 'todas' ? '' : v)}
        placeholder='Zona'
      />
    </div>
  )
}
