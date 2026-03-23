import type { EquipoDeLaZonaDTO } from '@/api/clients'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/design-system/base-ui/dialog'
import { Boton } from '@/design-system/ykn-ui/boton'
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
import { useState } from 'react'
import type { ItemFixture } from './tipos'

type Slots = { local: ItemFixture | null; visitante: ItemFixture | null }

function ItemDraggable({
  item,
  dragId,
  disabled
}: {
  item: ItemFixture
  dragId: string
  disabled?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: dragId, data: { item }, disabled })

  const esEspecial = item.type === 'especial'
  const estiloEspecial =
    esEspecial && item.valor === 'INTERZONAL'
      ? 'bg-blue-100 border-blue-300 text-blue-800'
      : esEspecial
        ? 'bg-amber-100 border-amber-300 text-amber-800'
        : 'bg-background border-border'

  const label =
    item.type === 'equipo'
      ? (item.equipo.nombre ?? '—')
      : item.valor === 'INTERZONAL'
        ? 'Interzonal'
        : 'Libre'

  return (
    <div
      ref={setNodeRef}
      style={
        transform ? { transform: CSS.Translate.toString(transform) } : undefined
      }
      className={`px-3 py-1.5 rounded-md border text-sm font-medium touch-none select-none transition-opacity ${estiloEspecial} ${
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'opacity-50' : ''}`}
      {...(disabled ? {} : listeners)}
      {...(disabled ? {} : attributes)}
    >
      {label}
    </div>
  )
}

function SlotDroppable({
  id,
  label,
  item
}: {
  id: string
  label: string
  item: ItemFixture | null
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  const displayLabel =
    item == null
      ? null
      : item.type === 'equipo'
        ? (item.equipo.nombre ?? '—')
        : item.valor === 'INTERZONAL'
          ? 'Interzonal'
          : 'Libre'

  const esEspecial = item?.type === 'especial'
  const estiloEspecial =
    esEspecial && item?.valor === 'INTERZONAL'
      ? 'bg-blue-100 text-blue-800'
      : esEspecial
        ? 'bg-amber-100 text-amber-800'
        : ''

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 rounded-lg border-2 border-dashed p-3 min-h-[56px] flex flex-col items-center justify-center transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
      }`}
    >
      <p className='text-xs font-medium text-muted-foreground mb-1'>{label}</p>
      {displayLabel ? (
        <span
          className={`text-sm font-medium px-2 py-0.5 rounded ${estiloEspecial}`}
        >
          {displayLabel}
        </span>
      ) : (
        <span className='text-xs text-muted-foreground/50'>Arrastrá acá</span>
      )}
    </div>
  )
}

export function ModalAgregarJornada({
  abierto,
  onCerrar,
  equipos,
  onAgregar
}: {
  abierto: boolean
  onCerrar: () => void
  equipos: EquipoDeLaZonaDTO[]
  onAgregar: (local: ItemFixture, visitante: ItemFixture) => void
}) {
  const [slots, setSlots] = useState<Slots>({ local: null, visitante: null })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  // IDs de equipos ya asignados a cada slot
  const localEquipoId =
    slots.local?.type === 'equipo' ? slots.local.equipo.id : null
  const visitanteEquipoId =
    slots.visitante?.type === 'equipo' ? slots.visitante.equipo.id : null

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const item = active.data.current?.item as ItemFixture | undefined
    if (!item) return
    const overId = String(over.id)

    if (overId === 'slot-local') {
      // Impedir que el mismo equipo esté en ambos slots
      if (
        item.type === 'equipo' &&
        slots.visitante?.type === 'equipo' &&
        slots.visitante.equipo.id === item.equipo.id
      )
        return
      setSlots((s) => ({ ...s, local: item }))
    } else if (overId === 'slot-visitante') {
      if (
        item.type === 'equipo' &&
        slots.local?.type === 'equipo' &&
        slots.local.equipo.id === item.equipo.id
      )
        return
      setSlots((s) => ({ ...s, visitante: item }))
    }
  }

  function handleConfirmar() {
    if (slots.local && slots.visitante) {
      onAgregar(slots.local, slots.visitante)
      setSlots({ local: null, visitante: null })
      onCerrar()
    }
  }

  function handleCerrar() {
    setSlots({ local: null, visitante: null })
    onCerrar()
  }

  const equiposItems: ItemFixture[] = equipos.map((e) => ({
    type: 'equipo',
    equipo: e
  }))
  const especiales: ItemFixture[] = [
    { type: 'especial', valor: 'LIBRE' },
    { type: 'especial', valor: 'INTERZONAL' }
  ]

  return (
    <Dialog open={abierto} onOpenChange={(o) => !o && handleCerrar()}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Agregar jornada</DialogTitle>
        </DialogHeader>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className='flex gap-4 mt-2 mb-4'>
            <SlotDroppable id='slot-local' label='LOCAL' item={slots.local} />
            <SlotDroppable
              id='slot-visitante'
              label='VISITANTE'
              item={slots.visitante}
            />
          </div>
          <div className='flex gap-6'>
            <div className='flex-1'>
              <p className='text-xs font-medium text-muted-foreground mb-2'>
                Equipos de la zona
              </p>
              <div className='flex flex-wrap gap-2'>
                {equiposItems.map((item) => {
                  const eId = (
                    item as { type: 'equipo'; equipo: EquipoDeLaZonaDTO }
                  ).equipo.id
                  // Un equipo no puede jugar contra sí mismo: deshabilitarlo si ya
                  // está en el slot contrario al que se podría arrastrar.
                  const enLocal = eId === localEquipoId
                  const enVisitante = eId === visitanteEquipoId
                  const disabled = enLocal && enVisitante // ambos slots = mismo equipo (imposible en uso normal, por si acaso)
                  return (
                    <ItemDraggable
                      key={eId}
                      item={item}
                      dragId={`team-${eId}`}
                      disabled={disabled}
                    />
                  )
                })}
              </div>
            </div>
            <div className='w-28 shrink-0'>
              <p className='text-xs font-medium text-muted-foreground mb-2'>
                Especiales
              </p>
              <div className='flex flex-col gap-2'>
                {especiales.map((item) => (
                  <ItemDraggable
                    key={(item as { type: 'especial'; valor: string }).valor}
                    item={item}
                    dragId={`especial-${(item as { type: 'especial'; valor: string }).valor}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </DndContext>
        <DialogFooter className='mt-4'>
          <Boton variant='outline' onClick={handleCerrar}>
            Cancelar
          </Boton>
          <Boton
            disabled={slots.local == null || slots.visitante == null}
            onClick={handleConfirmar}
          >
            Agregar
          </Boton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
