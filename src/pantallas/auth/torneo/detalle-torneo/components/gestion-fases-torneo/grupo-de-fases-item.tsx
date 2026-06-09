import { Card, CardContent } from '@/design-system/base-ui/card'
import ModalEliminacion from '@/design-system/modal-eliminacion'
import { Boton } from '@/design-system/ykn-ui/boton'
import Icono from '@/design-system/ykn-ui/icono'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { cn } from '@/logica-compartida/utils'
import { GripVertical } from 'lucide-react'
import type { FaseDTO, TorneoCategoriaDTO } from '@/api/clients'
import { TituloFase } from '../../../crear-torneo/components/titulo-fase'
import { FaseItem } from '../fase-item/fase-item'
import type { FaseEstado } from '../../lib'
import type { GrupoDeFasesEstado } from './lib/tipos'
import { idDragFaseEnGrupo, idDragGrupoDrop } from './lib/estructura-utils'

interface GrupoDeFasesItemProps {
  grupo: GrupoDeFasesEstado
  torneoId: number
  nombreTorneo: string
  torneoFases: FaseDTO[]
  categoriasTorneo: TorneoCategoriaDTO[]
  onActualizarNombre: (nombre: string) => void
  onActualizarFase: (faseIndex: number, campo: string, valor: string) => void
  onEliminarFase: (faseIndex: number) => void
  onEliminarGrupo: () => void
  onIrAZonas: (faseId: number) => void
  estaGuardando: boolean
}

interface FaseSortableEnGrupoProps {
  fase: FaseEstado
  faseIndex: number
  grupoIdLocal: string
  torneoId: number
  nombreTorneo: string
  faseOriginal?: FaseDTO
  categoriasTorneo: TorneoCategoriaDTO[]
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
  categoriasTorneo,
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

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 2 : undefined
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-md border bg-background p-2',
        isDragging && 'opacity-60'
      )}
    >
      <div className='flex items-start gap-1'>
        <button
          type='button'
          className={cn(
            'mt-1 flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md',
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
            categoriasTorneo={categoriasTorneo}
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
  torneoId,
  nombreTorneo,
  torneoFases,
  categoriasTorneo,
  onActualizarNombre,
  onActualizarFase,
  onEliminarFase,
  onEliminarGrupo,
  onIrAZonas,
  estaGuardando
}: GrupoDeFasesItemProps) {
  const dropId = idDragGrupoDrop(grupo)
  const { setNodeRef, isOver } = useDroppable({ id: dropId })

  const idsOrdenados = grupo.fases.map((f, i) =>
    idDragFaseEnGrupo(grupo.idLocal, f, i)
  )

  const botonEliminar = (
    <Boton
      type='button'
      variant='outline'
      className='h-8 w-8 min-w-8 p-0 border-none shadow-none text-destructive hover:text-destructive'
    >
      <Icono nombre='Eliminar' className='h-5 w-5 shrink-0' />
    </Boton>
  )

  return (
    <Card className='border-2 border-dashed shadow-md'>
      <CardContent className='py-3 space-y-3'>
        <div className='flex items-start justify-between gap-2'>
          <TituloFase
            numero={grupo.numero}
            valor={grupo.nombre}
            alCambiar={onActualizarNombre}
            soloLectura={false}
          />
          <ModalEliminacion
            titulo='Eliminar grupo de fases'
            subtitulo={`¿Estás seguro de que querés eliminar el grupo "${grupo.nombre}"? Las fases volverán al listado principal.`}
            eliminarOnClick={onEliminarGrupo}
            eliminarTexto='Eliminar'
            trigger={botonEliminar}
          />
        </div>

        <div
          ref={setNodeRef}
          className={cn(
            'min-h-[80px] space-y-2 rounded-md p-2 transition-colors',
            isOver && 'bg-primary/5 ring-2 ring-primary/30 ring-inset'
          )}
        >
          {grupo.fases.length === 0 ? (
            <p className='py-6 text-center text-sm text-muted-foreground'>
              Arrastrá fases acá
            </p>
          ) : (
            <SortableContext
              items={idsOrdenados}
              strategy={verticalListSortingStrategy}
            >
              {grupo.fases.map((fase, faseIndex) => (
                <FaseSortableEnGrupo
                  key={fase.id ?? `${grupo.idLocal}-${faseIndex}`}
                  fase={fase}
                  faseIndex={faseIndex}
                  grupoIdLocal={grupo.idLocal}
                  torneoId={torneoId}
                  nombreTorneo={nombreTorneo}
                  faseOriginal={torneoFases.find((f) => f.id === fase.id)}
                  categoriasTorneo={categoriasTorneo}
                  onActualizar={(campo, valor) =>
                    onActualizarFase(faseIndex, campo, valor)
                  }
                  onEliminar={() => onEliminarFase(faseIndex)}
                  onIrAZonas={onIrAZonas}
                  estaGuardando={estaGuardando}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
