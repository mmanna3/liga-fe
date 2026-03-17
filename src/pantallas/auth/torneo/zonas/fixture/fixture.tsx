import { api } from '@/api/api'
import type { EquipoDeLaZonaDTO, FixtureAlgoritmoDTO } from '@/api/clients'
import useApiQuery from '@/api/hooks/use-api-query'
import FlujoHomeLayout from '@/design-system/ykn-ui/flujo-home-layout'
import { rutasNavegacion } from '@/ruteo/rutas'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

type ItemFixture =
  | { type: 'equipo'; equipo: EquipoDeLaZonaDTO }
  | { type: 'especial'; valor: 'LIBRE' | 'INTERZONAL' }

function labelItem(item: ItemFixture): string {
  if (item.type === 'equipo') {
    return (
      [item.equipo.codigo, item.equipo.nombre, item.equipo.club]
        .filter(Boolean)
        .join(' · ') || '—'
    )
  }
  return item.valor === 'INTERZONAL' ? 'Interzonal' : 'Libre'
}

function FilaLista({
  item,
  index,
  isDragging
}: {
  item: ItemFixture
  index: number
  isDragging?: boolean
}) {
  const id = `left-${index}`
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingState
  } = useDraggable({ id, data: { item, index } })
  const dragging = isDragging ?? isDraggingState

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-md border bg-background px-3 py-2 transition-colors touch-none ${
        dragging
          ? 'opacity-50 shadow-lg'
          : 'cursor-grab active:cursor-grabbing hover:bg-muted/50'
      }`}
      {...listeners}
      {...attributes}
    >
      <span className='text-muted-foreground font-medium w-8 shrink-0'>
        {index + 1}
      </span>
      <span
        className={
          item.type === 'especial'
            ? item.valor === 'INTERZONAL'
              ? 'px-2 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-800 font-medium'
              : 'px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800 font-medium'
            : ''
        }
      >
        {labelItem(item)}
      </span>
    </li>
  )
}

function SlotDroppable({
  index,
  children
}: {
  index: number
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `drop-${index}` })
  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'ring-2 ring-primary rounded-md' : ''}
    >
      {children}
    </div>
  )
}

function EspecialDraggable({ valor }: { valor: 'LIBRE' | 'INTERZONAL' }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `especial-${valor}`,
    data: { item: { type: 'especial' as const, valor } }
  })

  const estilos =
    valor === 'INTERZONAL'
      ? 'bg-blue-100 border border-blue-300 text-blue-800'
      : 'bg-amber-100 border border-amber-300 text-amber-800'

  return (
    <div
      ref={setNodeRef}
      className={`rounded-md px-3 py-2 ${estilos} font-medium cursor-grab active:cursor-grabbing text-center touch-none ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      {valor === 'INTERZONAL' ? 'Interzonal' : 'Libre'}
    </div>
  )
}

export default function Fixture() {
  const {
    id: torneoIdParam,
    faseId: faseIdParam,
    zonaId: zonaIdParam
  } = useParams<{ id: string; faseId: string; zonaId: string }>()
  const torneoId = Number(torneoIdParam)
  const faseId = Number(faseIdParam)
  const zonaId = Number(zonaIdParam)

  const { data: torneo } = useApiQuery({
    key: ['torneo', torneoId],
    fn: () => api.torneoGET(torneoId),
    activado: Number.isFinite(torneoId)
  })

  const { data: zonas = [] } = useApiQuery({
    key: ['zonasAll', faseId],
    fn: () => api.zonasAll(faseId),
    activado: Number.isFinite(faseId)
  })

  const { data: algoritmos = [] } = useApiQuery({
    key: ['fixtureAlgoritmoAll'],
    fn: () => api.fixtureAlgoritmoAll()
  })

  const fase = useMemo(
    () => torneo?.fases?.find((f) => f.id === faseId),
    [torneo, faseId]
  )

  const zona = useMemo(
    () => zonas.find((z) => z.id === zonaId),
    [zonas, zonaId]
  )

  const inicialOrdenado = useMemo(() => {
    const equipos = zona?.equipos ?? []
    const sorted = [...equipos].sort((a, b) =>
      (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es')
    )
    return sorted.map((equipo) => ({ type: 'equipo' as const, equipo }))
  }, [zona?.equipos])

  const [listaOrdenada, setListaOrdenada] = useState<ItemFixture[]>([])

  useEffect(() => {
    setListaOrdenada(inicialOrdenado)
  }, [inicialOrdenado])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const overId = String(over.id)
    if (overId === 'drop-derecha') {
      if (String(active.id).startsWith('left-')) {
        const idx = parseInt(String(active.id).replace('left-', ''), 10)
        if (!Number.isNaN(idx)) {
          setListaOrdenada((prev) => {
            const item = prev[idx]
            if (item?.type === 'especial') {
              return prev.filter((_, i) => i !== idx)
            }
            return prev
          })
        }
      }
      return
    }

    if (!overId.startsWith('drop-')) return
    const dropIndex = parseInt(overId.replace('drop-', ''), 10)
    if (Number.isNaN(dropIndex) || dropIndex < 0) return

    const activeId = String(active.id)

    if (activeId === 'especial-INTERZONAL' || activeId === 'especial-LIBRE') {
      const valor = activeId === 'especial-INTERZONAL' ? 'INTERZONAL' : 'LIBRE'
      const item: ItemFixture = { type: 'especial', valor }
      setListaOrdenada((prev) => {
        const next = [...prev]
        const insertAt = Math.min(dropIndex, next.length)
        next.splice(insertAt, 0, item)
        return next
      })
      return
    }

    if (activeId.startsWith('left-')) {
      const dragIndex = parseInt(activeId.replace('left-', ''), 10)
      if (Number.isNaN(dragIndex)) return
      setListaOrdenada((prev) => {
        const next = [...prev]
        const [removed] = next.splice(dragIndex, 1)
        if (removed == null) return prev
        const insertAt =
          dropIndex > dragIndex
            ? Math.min(dropIndex - 1, next.length)
            : Math.min(dropIndex, next.length)
        next.splice(insertAt, 0, removed)
        return next
      })
    }
  }, [])

  const pathVolver = `${rutasNavegacion.detalleTorneo}/${torneoId}/fases/${faseId}/zonas`
  const subtitulo = [
    torneo?.nombre ?? '—',
    fase?.nombre ?? '—',
    zona?.nombre ?? '—'
  ].join(' · ')

  const cantidadEquipos = listaOrdenada.length

  const contenido = !zona ? (
    <p className='text-muted-foreground py-4'>Cargando zona...</p>
  ) : (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <p className='text-sm text-muted-foreground mb-4'>
        Algoritmos de fixture disponibles:{' '}
        {algoritmos.map((a: FixtureAlgoritmoDTO) => (
          <span key={a.id ?? a.cantidadDeEquipos}>
            <span
              className={
                a.cantidadDeEquipos === cantidadEquipos
                  ? 'py-1 px-2 rounded-md mx-1 bg-primary text-primary-foreground'
                  : 'py-1 px-2 rounded-md bg-muted-foreground/10 mx-1 text-muted-foreground'
              }
            >
              {a.cantidadDeEquipos}
            </span>
          </span>
        ))}
      </p>
      <div className='flex gap-8 py-6'>
        <div className='flex-1 min-w-0'>
          <h3 className='text-sm font-medium text-muted-foreground mb-2'>
            Orden de equipos (arrastrá para reordenar)
          </h3>
          <ul className='space-y-2 list-none p-0 m-0'>
            {listaOrdenada.map((item, index) => (
              <SlotDroppable key={`slot-${index}`} index={index}>
                <FilaLista item={item} index={index} />
              </SlotDroppable>
            ))}
            <SlotDroppable index={listaOrdenada.length}>
              <div className='rounded-md border-2 border-dashed border-muted-foreground/25 px-3 py-2 min-h-[44px]' />
            </SlotDroppable>
          </ul>
        </div>

        <div className='w-48 shrink-0'>
          <h3 className='text-sm font-medium text-muted-foreground mb-2'>
            Agregar a la lista
          </h3>
          <ZonaDerechaDroppable>
            <div className='space-y-2'>
              <EspecialDraggable valor='INTERZONAL' />
              <EspecialDraggable valor='LIBRE' />
            </div>
            <p className='text-xs text-muted-foreground pt-2'>
              Arrastrá Libre o Interzonal a la lista para sumarlos. Arrastrá
              desde la lista acá para quitarlos.
            </p>
          </ZonaDerechaDroppable>
        </div>
      </div>
    </DndContext>
  )

  return (
    <FlujoHomeLayout
      titulo='Fixture'
      subtitulo={subtitulo}
      iconoTitulo='Fixture'
      pathBotonVolver={pathVolver}
      contenido={contenido}
    />
  )
}

function ZonaDerechaDroppable({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'drop-derecha' })
  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-2 border-dashed p-4 min-h-[120px] transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}
    >
      {children}
    </div>
  )
}
