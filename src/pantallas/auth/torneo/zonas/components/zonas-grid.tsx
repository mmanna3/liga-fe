import { EquipoDTO } from '@/api/clients'
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable'
import { Boton } from '@/design-system/ykn-ui/boton'
import { cn } from '@/logica-compartida/utils'
import { GripVertical, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { idSortableZona, type ZonaEstado } from './tipos'
import { Zona } from './zona-card'

interface ContenidoZonasEditableProps {
  zonasEstado: ZonaEstado[]
  onActualizarNombre: (index: number, nombre: string) => void
  onQuitarEquipo: (index: number, equipoId: number) => void
  onDropEquipo: (index: number, equipo: EquipoDTO) => void
  onEliminarZona: (index: number) => void
  onAgregarZona: () => void
  onReordenarZonas: (fromIndex: number, toIndex: number) => void
  onIrAFixture?: (zonaId: number) => void
  /** En eliminación directa los nombres vienen de la categoría y no se editan. */
  nombreZonaEditable?: boolean
  /** En eliminación directa no se pueden borrar zonas (una por categoría). */
  puedeEliminarZona?: boolean
}

interface SortableZonaItemProps {
  zona: ZonaEstado
  index: number
  onActualizarNombre: (index: number, nombre: string) => void
  onQuitarEquipo: (index: number, equipoId: number) => void
  onDropEquipo: (index: number, equipo: EquipoDTO) => void
  onEliminarZona: (index: number) => void
  onIrAFixture?: (zonaId: number) => void
  nombreZonaEditable: boolean
  puedeEliminarZona: boolean
  /** Asa de arrastre solo cuando hay más de una zona. */
  mostrarAsaReorden: boolean
}

function SortableZonaItem({
  zona,
  index,
  onActualizarNombre,
  onQuitarEquipo,
  onDropEquipo,
  onEliminarZona,
  onIrAFixture,
  nombreZonaEditable,
  puedeEliminarZona,
  mostrarAsaReorden
}: SortableZonaItemProps) {
  const id = idSortableZona(zona)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled: !mostrarAsaReorden })

  const style = {
    // Solo traslación: `Transform` incluye scale y se ve como un zoom raro al reordenar.
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 2 : undefined
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='min-w-[280px] flex-1 relative'
    >
      {mostrarAsaReorden && (
        <button
          type='button'
          className={cn(
            'absolute left-1 top-3 z-10 flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-md',
            'text-muted-foreground hover:bg-muted/80 active:cursor-grabbing'
          )}
          aria-label='Reordenar zona'
          {...attributes}
          {...listeners}
        >
          <GripVertical className='h-4 w-4' />
        </button>
      )}
      <div className={cn(mostrarAsaReorden && 'pl-8')}>
        <Zona
          zona={zona}
          onNombreChange={(n) => onActualizarNombre(index, n)}
          onQuitarEquipo={(eqId) => onQuitarEquipo(index, eqId)}
          onDropEquipo={(eq) => onDropEquipo(index, eq)}
          onEliminar={
            puedeEliminarZona ? () => onEliminarZona(index) : undefined
          }
          editable
          nombreEditable={nombreZonaEditable}
          onIrAFixture={
            zona.id != null && onIrAFixture
              ? () => onIrAFixture(zona.id!)
              : undefined
          }
        />
      </div>
    </div>
  )
}

/** Contenido compartido: grid de zonas editables + buscador. Usado en CrearZonas y ModificarZonas. */
export function ContenidoZonasEditable({
  zonasEstado,
  onActualizarNombre,
  onQuitarEquipo,
  onDropEquipo,
  onEliminarZona,
  onAgregarZona,
  onReordenarZonas,
  onIrAFixture,
  nombreZonaEditable = true,
  puedeEliminarZona = true
}: ContenidoZonasEditableProps) {
  const idsOrdenados = useMemo(
    () => zonasEstado.map((z) => idSortableZona(z)),
    [zonasEstado]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over == null || active.id === over.id) return
    const oldIndex = idsOrdenados.indexOf(String(active.id))
    const newIndex = idsOrdenados.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    onReordenarZonas(oldIndex, newIndex)
  }

  const mostrarAsaReorden = zonasEstado.length > 1

  return (
    <div className='space-y-6'>
      <Boton
        type='button'
        variant='outline'
        size='sm'
        onClick={onAgregarZona}
        className='py-1 text-xs'
      >
        Agregar Zona
        <Plus className='w-3 h-3' />
      </Boton>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={idsOrdenados} strategy={rectSortingStrategy}>
          <div className='flex flex-wrap gap-4 items-start'>
            {zonasEstado.map((zona, index) => (
              <SortableZonaItem
                key={idSortableZona(zona)}
                zona={zona}
                index={index}
                onActualizarNombre={onActualizarNombre}
                onQuitarEquipo={onQuitarEquipo}
                onDropEquipo={onDropEquipo}
                onEliminarZona={onEliminarZona}
                onIrAFixture={onIrAFixture}
                nombreZonaEditable={nombreZonaEditable}
                puedeEliminarZona={puedeEliminarZona}
                mostrarAsaReorden={mostrarAsaReorden}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
