import { Card, CardContent } from '@/design-system/base-ui/card'
import ModalEliminacion from '@/design-system/modal-eliminacion'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  rectSortingStrategy,
  SortableContext,
  useSortable
} from '@dnd-kit/sortable'
import { cn } from '@/logica-compartida/utils'
import { GripVertical, Layers } from 'lucide-react'
import type { FaseDTO } from '@/api/clients'
import { TituloFase } from '../../../crear-torneo/components/titulo-fase'
import { FaseItem } from '../fase-item/fase-item'
import type { FaseEstado } from '../../lib'
import type { GrupoDeFasesEstado } from './lib/tipos'
import { PROFUNDIDAD_MAX_GRUPO } from './lib/tipos'
import {
  idDragFaseEnGrupo,
  idDragGrupoDrop,
  idDragGrupoTopLevel,
  idTopLevelDesdeElemento
} from './lib/estructura-utils'

export interface GrupoDeFasesCallbacks {
  onActualizarGrupo: (grupoIdLocal: string, nombre: string) => void
  onActualizarFase: (faseId: number, campo: string, valor: string) => void
  onEliminarFase: (faseId: number) => void
  onEliminarGrupo: (grupoIdLocal: string) => void
  onAgregarSubgrupo: (grupoPadreIdLocal: string) => void
  onIrAZonas: (faseId: number) => void
}

interface GrupoDeFasesItemProps extends GrupoDeFasesCallbacks {
  grupo: GrupoDeFasesEstado
  profundidad: number
  torneoId: number
  nombreTorneo: string
  torneoFases: FaseDTO[]
  estaGuardando: boolean
  sortable?: boolean
}

interface FaseSortableEnGrupoProps {
  fase: FaseEstado
  faseIndex: number
  grupoIdLocal: string
  torneoId: number
  nombreTorneo: string
  faseOriginal?: FaseDTO
  onActualizar: (campo: string, valor: string) => void
  onEliminar: () => void
  onIrAZonas: (faseId: number) => void
  estaGuardando: boolean
}

function FaseSortableEnGrupo({
  fase,
  faseIndex,
  grupoIdLocal,
  torneoId,
  nombreTorneo,
  faseOriginal,
  onActualizar,
  onEliminar,
  onIrAZonas,
  estaGuardando
}: FaseSortableEnGrupoProps) {
  const sortId = idDragFaseEnGrupo(grupoIdLocal, fase, faseIndex)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: sortId })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 2 : undefined
      }}
      className={cn(
        'rounded-md border bg-background p-2',
        isDragging && 'opacity-60'
      )}
    >
      <div className='flex items-start gap-1'>
        <button
          type='button'
          className={cn(
            'flex h-7 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md',
            'text-muted-foreground hover:bg-muted/80 active:cursor-grabbing'
          )}
          aria-label='Reordenar fase en el grupo'
          {...attributes}
          {...listeners}
        >
          <GripVertical className='h-4 w-4' />
        </button>
        <div className='min-w-0 flex-1'>
          <FaseItem
            torneoId={torneoId}
            nombreTorneo={nombreTorneo}
            fase={fase}
            faseIndex={faseIndex}
            faseOriginal={faseOriginal}
            categoriasFase={faseOriginal?.categorias ?? []}
            onActualizar={onActualizar}
            onEliminar={onEliminar}
            onIrAZonas={() => {
              if (fase.id != null) onIrAZonas(fase.id)
            }}
            estaGuardando={estaGuardando}
            enCard
          />
        </div>
      </div>
    </div>
  )
}

export function GrupoDeFasesItem({
  grupo,
  profundidad,
  torneoId,
  nombreTorneo,
  torneoFases,
  onActualizarGrupo,
  onActualizarFase,
  onEliminarFase,
  onEliminarGrupo,
  onAgregarSubgrupo,
  onIrAZonas,
  estaGuardando,
  sortable = false
}: GrupoDeFasesItemProps) {
  const dropId = idDragGrupoDrop(grupo.idLocal)
  const { setNodeRef, isOver } = useDroppable({ id: dropId })

  const sortableHook = useSortable({
    id: idDragGrupoTopLevel(grupo),
    disabled: !sortable
  })

  const idsOrdenados = grupo.elementos.map(idTopLevelDesdeElemento)
  const puedeAgregarSubgrupo = profundidad < PROFUNDIDAD_MAX_GRUPO

  const botonEliminar = (
    <Boton
      type='button'
      variant='outline'
      className='h-8 w-8 min-w-8 p-0 border-none shadow-none text-destructive hover:text-destructive'
    >
      <Icono nombre='Eliminar' className='h-5 w-5 shrink-0' />
    </Boton>
  )

  const card = (
    <Card
      className={cn(
        'border-2 border-dashed shadow-md',
        profundidad > 1 && 'border-muted'
      )}
    >
      <CardContent className='py-3 space-y-3'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex min-w-0 flex-1 items-start gap-1'>
            {sortable && (
              <button
                type='button'
                className={cn(
                  'mt-0.5 flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md',
                  'text-muted-foreground hover:bg-muted/80 active:cursor-grabbing'
                )}
                aria-label='Reordenar grupo'
                {...sortableHook.attributes}
                {...sortableHook.listeners}
              >
                <GripVertical className='h-4 w-4' />
              </button>
            )}
            <TituloFase
              numero={grupo.numero}
              valor={grupo.nombre}
              alCambiar={(nombre) => onActualizarGrupo(grupo.idLocal, nombre)}
              soloLectura={false}
            />
          </div>
          <div className='flex shrink-0 items-center gap-1'>
            {puedeAgregarSubgrupo && (
              <Boton
                type='button'
                variant='outline'
                size='sm'
                className='h-8 px-2 text-xs'
                onClick={() => onAgregarSubgrupo(grupo.idLocal)}
              >
                <Layers className='h-3 w-3' />
                Subgrupo
              </Boton>
            )}
            <ModalEliminacion
              titulo='Eliminar grupo de fases'
              subtitulo={`¿Estás seguro de que querés eliminar el grupo "${grupo.nombre}"? Las fases volverán al contenedor padre.`}
              eliminarOnClick={() => onEliminarGrupo(grupo.idLocal)}
              eliminarTexto='Eliminar'
              trigger={botonEliminar}
            />
          </div>
        </div>

        <div
          ref={setNodeRef}
          className={cn(
            'min-h-[80px] rounded-md p-2 transition-colors',
            grupo.elementos.length > 0 &&
              'grid grid-cols-1 lg:grid-cols-2 gap-2',
            isOver && 'bg-primary/5 ring-2 ring-primary/30 ring-inset'
          )}
        >
          {grupo.elementos.length === 0 ? (
            <p className='col-span-full py-6 text-center text-sm text-muted-foreground'>
              Arrastrá fases acá
            </p>
          ) : (
            <SortableContext
              items={idsOrdenados}
              strategy={rectSortingStrategy}
            >
              {grupo.elementos.map((el, index) => {
                if (el.tipo === 'fase') {
                  return (
                    <FaseSortableEnGrupo
                      key={el.fase.id ?? `${grupo.idLocal}-fase-${index}`}
                      fase={el.fase}
                      faseIndex={index}
                      grupoIdLocal={grupo.idLocal}
                      torneoId={torneoId}
                      nombreTorneo={nombreTorneo}
                      faseOriginal={torneoFases.find(
                        (f) => f.id === el.fase.id
                      )}
                      onActualizar={(campo, valor) => {
                        if (el.fase.id != null) {
                          onActualizarFase(el.fase.id, campo, valor)
                        }
                      }}
                      onEliminar={() => {
                        if (el.fase.id != null) onEliminarFase(el.fase.id)
                      }}
                      onIrAZonas={onIrAZonas}
                      estaGuardando={estaGuardando}
                    />
                  )
                }

                const subgrupoDragId = idDragGrupoTopLevel(el.grupo)
                return (
                  <SubgrupoEnContenedor
                    key={el.grupo.idLocal}
                    dragId={subgrupoDragId}
                    grupo={el.grupo}
                    profundidad={profundidad + 1}
                    torneoId={torneoId}
                    nombreTorneo={nombreTorneo}
                    torneoFases={torneoFases}
                    callbacks={{
                      onActualizarGrupo,
                      onActualizarFase,
                      onEliminarFase,
                      onEliminarGrupo,
                      onAgregarSubgrupo,
                      onIrAZonas
                    }}
                    estaGuardando={estaGuardando}
                  />
                )
              })}
            </SortableContext>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (!sortable) return card

  return (
    <div
      ref={sortableHook.setNodeRef}
      style={{
        transform: CSS.Translate.toString(sortableHook.transform),
        transition: sortableHook.transition,
        zIndex: sortableHook.isDragging ? 2 : undefined
      }}
      className={cn(sortableHook.isDragging && 'opacity-60')}
    >
      {card}
    </div>
  )
}

interface SubgrupoEnContenedorProps {
  dragId: string
  grupo: GrupoDeFasesEstado
  profundidad: number
  torneoId: number
  nombreTorneo: string
  torneoFases: FaseDTO[]
  callbacks: GrupoDeFasesCallbacks
  estaGuardando: boolean
}

function SubgrupoEnContenedor({
  dragId,
  grupo,
  profundidad,
  torneoId,
  nombreTorneo,
  torneoFases,
  callbacks,
  estaGuardando
}: SubgrupoEnContenedorProps) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners
  } = useSortable({ id: dragId })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 2 : undefined
      }}
      className={cn(
        'col-span-full flex items-start gap-1',
        isDragging && 'opacity-60'
      )}
    >
      <button
        type='button'
        className={cn(
          'mt-3 flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md',
          'text-muted-foreground hover:bg-muted/80 active:cursor-grabbing'
        )}
        aria-label='Reordenar subgrupo'
        {...attributes}
        {...listeners}
      >
        <GripVertical className='h-4 w-4' />
      </button>
      <div className='min-w-0 flex-1'>
        <GrupoDeFasesItem
          grupo={grupo}
          profundidad={profundidad}
          torneoId={torneoId}
          nombreTorneo={nombreTorneo}
          torneoFases={torneoFases}
          {...callbacks}
          estaGuardando={estaGuardando}
        />
      </div>
    </div>
  )
}
