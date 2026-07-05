import { Badge } from '@/design-system/base-ui/badge'
import { Input } from '@/design-system/base-ui/input'
import { Label } from '@/design-system/base-ui/label'
import { Boton } from '@/design-system/ykn-ui/boton'
import { IconoInformacion } from '@/design-system/ykn-ui/icono-informacion'
import { cn } from '@/logica-compartida/utils'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2, X } from 'lucide-react'
import { useMemo, useState, type MouseEvent } from 'react'
import type { Categoria } from '../tipos'

const ANIO_ACTUAL = new Date().getFullYear()

const CLASE_BADGE_CATEGORIA =
  'bg-primary/10 text-primary border-primary/20 px-1.5 py-1.5 text-xs'
const CLASE_BADGE_CATEGORIA_EDITABLE = `${CLASE_BADGE_CATEGORIA} cursor-pointer hover:bg-primary/20 transition-colors`

/** Ordena por `orden`, renumera 1…n en categorías con nombre y luego las sin nombre. */
function ordenarYRenumerar(cats: Categoria[]): Categoria[] {
  const conNombre = cats
    .filter((c) => c.nombre.trim())
    .sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id))
  const sinNombre = cats.filter((c) => !c.nombre.trim())
  const m = conNombre.length
  return [
    ...conNombre.map((c, i) => ({ ...c, orden: i + 1 })),
    ...sinNombre.map((c, i) => ({ ...c, orden: m + i + 1 }))
  ]
}

function reordenarPorArrastre(
  valor: Categoria[],
  oldIndex: number,
  newIndex: number
): Categoria[] {
  const conNombre = valor
    .filter((c) => c.nombre.trim())
    .sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id))
  const sinNombre = valor.filter((c) => !c.nombre.trim())
  const reordered = arrayMove(conNombre, oldIndex, newIndex)
  const m = reordered.length
  return [
    ...reordered.map((c, i) => ({ ...c, orden: i + 1 })),
    ...sinNombre.map((c, i) => ({ ...c, orden: m + i + 1 }))
  ]
}

interface CategoriasProps {
  valor: Categoria[]
  alCambiar: (categorias: Categoria[]) => void
  error?: string
  titulo?: string
  /** Texto del tooltip junto al título (icono de información) */
  infoTitulo?: string
  /** Si true, solo muestra las categorías sin posibilidad de editar/agregar/quitar */
  soloLectura?: boolean
}

interface SortableBadgeCategoriaProps {
  categoria: Categoria
  soloLectura: boolean
  mostrarAsaReorden: boolean
  onClicBadge: () => void
  onQuitar: (e: MouseEvent) => void
}

function SortableBadgeCategoria({
  categoria,
  soloLectura,
  mostrarAsaReorden,
  onClicBadge,
  onQuitar
}: SortableBadgeCategoriaProps) {
  const id = categoria.id
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled: soloLectura || !mostrarAsaReorden })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 2 : undefined
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='relative inline-flex max-w-full items-center'
    >
      {mostrarAsaReorden && (
        <button
          type='button'
          className={cn(
            'mr-0.5 flex h-6 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md',
            'text-muted-foreground hover:bg-muted/80 active:cursor-grabbing'
          )}
          aria-label='Reordenar categoría'
          {...attributes}
          {...listeners}
        >
          <GripVertical className='h-4 w-4' />
        </button>
      )}
      <Badge
        variant='secondary'
        className={
          soloLectura ? CLASE_BADGE_CATEGORIA : CLASE_BADGE_CATEGORIA_EDITABLE
        }
        onClick={soloLectura ? undefined : onClicBadge}
      >
        {categoria.nombre}
        {!soloLectura && (categoria.anioDesde || categoria.anioHasta) && (
          <span className='ml-1'>
            {categoria.anioDesde === categoria.anioHasta
              ? `(${categoria.anioDesde || '—'})`
              : `(${categoria.anioDesde || '—'}/${categoria.anioHasta || '—'})`}
          </span>
        )}
        {!soloLectura && (
          <button
            type='button'
            onClick={onQuitar}
            className='ml-1.5 hover:bg-muted rounded-full p-0.5'
          >
            <X className='w-3 h-3' />
          </button>
        )}
      </Badge>
    </div>
  )
}

export function Categorias({
  valor,
  alCambiar,
  error,
  titulo = 'Categorías',
  infoTitulo,
  soloLectura = false
}: CategoriasProps) {
  const [editandoCategoriaId, setEditandoCategoriaId] = useState<string | null>(
    null
  )
  const [erroresValidacion, setErroresValidacion] = useState<string[]>([])

  const categoriasConNombre = useMemo(
    () =>
      valor
        .filter((c) => c.nombre.trim())
        .sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id)),
    [valor]
  )

  const idsSortable = useMemo(
    () => categoriasConNombre.map((c) => c.id),
    [categoriasConNombre]
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
    if (soloLectura) return
    const { active, over } = event
    if (over == null || active.id === over.id) return
    const oldIndex = idsSortable.indexOf(String(active.id))
    const newIndex = idsSortable.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    alCambiar(reordenarPorArrastre(valor, oldIndex, newIndex))
  }

  const agregarCategoria = () => {
    const categoriasConNombrePrev = valor.filter((c) => c.nombre.trim() !== '')
    const nuevaCategoria: Categoria = {
      id: Date.now().toString(),
      nombre: '',
      anioDesde: '',
      anioHasta: '',
      orden: 0
    }
    alCambiar(ordenarYRenumerar([...categoriasConNombrePrev, nuevaCategoria]))
    setEditandoCategoriaId(nuevaCategoria.id)
    setErroresValidacion([])
  }

  const quitarCategoria = (id: string) => {
    alCambiar(ordenarYRenumerar(valor.filter((c) => c.id !== id)))
    if (editandoCategoriaId === id) {
      setEditandoCategoriaId(null)
      setErroresValidacion([])
    }
  }

  const actualizarCategoria = (id: string, campo: Partial<Categoria>) => {
    alCambiar(
      ordenarYRenumerar(
        valor.map((c) => (c.id === id ? { ...c, ...campo } : c))
      )
    )
    if (id === editandoCategoriaId) {
      setErroresValidacion([])
    }
  }

  const soloAnio = (valorAnio: string) => {
    const nums = valorAnio.replace(/\D/g, '')
    if (nums.length <= 4) return nums
    return nums.slice(0, 4)
  }

  const alClickearCategoria = (id: string) => {
    setEditandoCategoriaId(id)
    setErroresValidacion([])
  }

  const alGuardarCategoria = () => {
    if (!categoriaEditando) return

    const errores: string[] = []

    if (!categoriaEditando.nombre.trim()) {
      errores.push('El nombre de la categoría es requerido')
    }

    const desde = categoriaEditando.anioDesde.trim()
    const hasta = categoriaEditando.anioHasta.trim()

    if (!desde) {
      errores.push('El año "Desde" es requerido')
    }
    if (!hasta) {
      errores.push('El año "Hasta" es requerido')
    }

    if (desde && hasta) {
      const desdeNum = parseInt(desde, 10)
      const hastaNum = parseInt(hasta, 10)
      if (desdeNum > hastaNum) {
        errores.push('"Desde" debe ser menor o igual que "Hasta"')
      }
      if (hastaNum > ANIO_ACTUAL) {
        errores.push('"Hasta" no puede ser mayor al año actual')
      }
    }

    if (errores.length > 0) {
      setErroresValidacion(errores)
      return
    }

    setErroresValidacion([])
    setEditandoCategoriaId(null)
  }

  const categoriaEditando = editandoCategoriaId
    ? valor.find((c) => c.id === editandoCategoriaId)
    : null

  const mostrarAsaReorden = !soloLectura && categoriasConNombre.length > 1

  const renderBadges = () => {
    if (categoriasConNombre.length === 0) return null

    const badgeNodes = categoriasConNombre.map((categoria) =>
      mostrarAsaReorden ? (
        <SortableBadgeCategoria
          key={categoria.id}
          categoria={categoria}
          soloLectura={soloLectura}
          mostrarAsaReorden
          onClicBadge={() => alClickearCategoria(categoria.id)}
          onQuitar={(e) => {
            e.stopPropagation()
            quitarCategoria(categoria.id)
          }}
        />
      ) : (
        <Badge
          key={categoria.id}
          variant='secondary'
          className={
            soloLectura ? CLASE_BADGE_CATEGORIA : CLASE_BADGE_CATEGORIA_EDITABLE
          }
          onClick={
            soloLectura ? undefined : () => alClickearCategoria(categoria.id)
          }
        >
          {categoria.nombre}
          {!soloLectura && (categoria.anioDesde || categoria.anioHasta) && (
            <span className='ml-1'>
              {categoria.anioDesde === categoria.anioHasta
                ? `(${categoria.anioDesde || '—'})`
                : `(${categoria.anioDesde || '—'}/${categoria.anioHasta || '—'})`}
            </span>
          )}
          {!soloLectura && (
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                quitarCategoria(categoria.id)
              }}
              className='ml-1.5 hover:bg-muted rounded-full p-0.5'
            >
              <X className='w-3 h-3' />
            </button>
          )}
        </Badge>
      )
    )

    const inner = (
      <div className='flex flex-wrap items-center gap-1.5 mb-3'>
        {badgeNodes}
      </div>
    )

    if (mostrarAsaReorden) {
      return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={idsSortable} strategy={rectSortingStrategy}>
            {inner}
          </SortableContext>
        </DndContext>
      )
    }

    return inner
  }

  return (
    <div>
      {titulo ? (
        <Label
          className={cn(
            'flex items-center gap-1.5 mb-2 font-semibold',
            soloLectura ? 'text-sm text-muted-foreground' : 'text-md'
          )}
        >
          <span>{titulo}</span>
          {infoTitulo ? <IconoInformacion texto={infoTitulo} /> : null}
        </Label>
      ) : null}

      {valor.length > 0 && valor.some((c) => c.nombre) && renderBadges()}

      {!soloLectura && categoriaEditando && (
        <div className='p-3 bg-muted rounded-lg mb-2 max-w-2xl'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2'>
            <Input
              type='text'
              value={categoriaEditando.nombre}
              onChange={(e) =>
                actualizarCategoria(categoriaEditando.id, {
                  nombre: e.target.value
                })
              }
              placeholder='Ej: +40, Sub 15, Mayores'
              className='flex-1 min-w-0'
              autoFocus
            />
            <div className='flex items-center gap-2 sm:shrink-0'>
              <Input
                type='number'
                inputMode='numeric'
                min={1900}
                max={ANIO_ACTUAL}
                step={1}
                value={categoriaEditando.anioDesde}
                onChange={(e) =>
                  actualizarCategoria(categoriaEditando.id, {
                    anioDesde: soloAnio(e.target.value)
                  })
                }
                placeholder='Desde'
                className='w-20 text-center'
              />
              <span className='text-muted-foreground'>-</span>
              <Input
                type='number'
                inputMode='numeric'
                min={1900}
                max={ANIO_ACTUAL}
                step={1}
                value={categoriaEditando.anioHasta}
                onChange={(e) =>
                  actualizarCategoria(categoriaEditando.id, {
                    anioHasta: soloAnio(e.target.value)
                  })
                }
                placeholder='Hasta'
                className='w-20 text-center'
              />
              <Boton type='button' size='sm' onClick={alGuardarCategoria}>
                Guardar
              </Boton>
              <button
                type='button'
                onClick={() => quitarCategoria(categoriaEditando.id)}
                className='p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-md transition-colors'
                title='Eliminar categoría'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
            {erroresValidacion.length > 0 && (
              <ul className='text-sm text-destructive mt-2 list-disc list-inside'>
                {erroresValidacion.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!soloLectura && (
        <Boton
          type='button'
          variant='outline'
          size='sm'
          onClick={agregarCategoria}
          className='my-2'
        >
          <Plus className='w-3 h-3' />
          Agregar
        </Boton>
      )}
      {error && <p className='text-sm text-destructive mt-2'>{error}</p>}
    </div>
  )
}
