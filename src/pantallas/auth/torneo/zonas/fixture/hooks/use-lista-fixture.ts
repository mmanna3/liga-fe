import type { EquipoDeLaZonaDTO } from '@/api/clients'
import {
  hashEquiposDeLaZona,
  listaInicialDesdeBorradorOEquipos,
  ordenInicialListaFixture,
  reconciliarListaOrdenConEquiposActuales
} from '@/pantallas/auth/torneo/zonas/fixture/borrador/fixture-borrador-logica'
import { useFixtureBorradorStore } from '@/pantallas/auth/torneo/zonas/fixture/borrador/use-fixture-borrador-store'
import {
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ItemFixture } from '../tipos'

export function useListaFixture(equipos: EquipoDeLaZonaDTO[], zonaId: number) {
  const hashEquipos = useMemo(() => hashEquiposDeLaZona(equipos), [equipos])

  const [listaOrdenada, setListaOrdenada] = useState<ItemFixture[]>(() => {
    const borrador = useFixtureBorradorStore.getState().porZona[zonaId]
    return listaInicialDesdeBorradorOEquipos({
      equipos,
      hashEquiposActual: hashEquipos,
      borrador
    })
  })

  const hashEquiposRef = useRef(hashEquipos)
  useEffect(() => {
    if (hashEquiposRef.current === hashEquipos) return
    hashEquiposRef.current = hashEquipos
    const borrador = useFixtureBorradorStore.getState().porZona[zonaId]
    if (
      borrador?.hashEquipos === hashEquipos &&
      borrador.listaOrdenada.length > 0
    ) {
      setListaOrdenada(
        reconciliarListaOrdenConEquiposActuales(borrador.listaOrdenada, equipos)
      )
    } else {
      setListaOrdenada(ordenInicialListaFixture(equipos))
    }
  }, [hashEquipos, zonaId, equipos])

  useEffect(() => {
    useFixtureBorradorStore.getState().patch(zonaId, hashEquipos, {
      listaOrdenada
    })
  }, [zonaId, hashEquipos, listaOrdenada])

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
