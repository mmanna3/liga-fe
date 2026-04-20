import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import type { EquipoDeLaZonaDTO } from '@/api/clients'
import type { ItemFixture } from '../tipos'

export function useListaFixture(equipos: EquipoDeLaZonaDTO[]) {
  const inicialOrdenado = useMemo(() => {
    const sorted = [...equipos].sort((a, b) =>
      (a.nombre ?? '').localeCompare(b.nombre ?? '', 'es')
    )
    return sorted.map((equipo) => ({ type: 'equipo' as const, equipo }))
  }, [equipos])

  const [listaOrdenada, setListaOrdenada] = useState<ItemFixture[]>([])

  useEffect(() => {
    setListaOrdenada(inicialOrdenado)
  }, [inicialOrdenado])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
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

    const matchInterzonal = /^especial-INTERZONAL-(\d+)$/.exec(activeId)
    if (activeId === 'especial-LIBRE' || matchInterzonal) {
      let item: ItemFixture
      if (activeId === 'especial-LIBRE') {
        item = { type: 'especial', valor: 'LIBRE' }
      } else {
        const n = Number(matchInterzonal![1])
        if (!Number.isFinite(n) || n < 1) return
        item = {
          type: 'especial',
          valor: 'INTERZONAL',
          numero: n
        }
      }
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

  return { listaOrdenada, sensors, handleDragEnd }
}
